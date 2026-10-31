'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { createClient } from '@/lib/supabase/client';
import {
    readLocalPositions,
    writeLocalPositions,
    clearLocalPositions,
    loadRemotePositions,
    saveRemotePositions,
    sanitizePositions,
    replaceBroker,
    addPosition,
    removePosition,
} from '@/lib/portfolio/positionsStore';

// Posiciones de la cartera real del usuario. `positions` es null mientras se cargan.
// Con sesión se guardan en Supabase; sin sesión, en este navegador. Si una cuenta nueva tenía
// posiciones en el navegador, se pasan a la cuenta la primera vez (y se borran del navegador).
export function usePositions() {
    const { user, ready, enabled } = useSupabaseUser();
    const userId = user?.id ?? null;
    const portfolioIdRef = useRef(null);
    const [positions, setPositions] = useState(null);
    const [sync, setSync] = useState('idle'); // idle | saving | saved | error
    const [imported, setImported] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!ready) return;
        let alive = true;
        portfolioIdRef.current = null;

        (async () => {
            const local = readLocalPositions();
            if (!userId) {
                setSync('idle');
                if (alive) setPositions(local);
                return;
            }

            setSync('saving');
            try {
                const supabase = createClient();
                const remote = await loadRemotePositions(supabase);
                if (!alive) return;
                portfolioIdRef.current = remote.portfolioId;

                if (remote.positions.length === 0 && local.length > 0) {
                    await saveRemotePositions(supabase, remote.portfolioId, local);
                    clearLocalPositions();
                    if (!alive) return;
                    setImported(true);
                    setPositions(local);
                } else {
                    setPositions(remote.positions);
                }
                setSync('saved');
            } catch (err) {
                console.warn('No se pudo cargar la cartera real de la cuenta:', err.message);
                if (!alive) return;
                setSync('error');
                setPositions(local);
            }
        })();

        return () => { alive = false; };
    }, [ready, userId, reloadKey]);

    const commit = useCallback(async (next) => {
        const clean = sanitizePositions(next);
        setPositions(clean);
        if (!userId) {
            writeLocalPositions(clean);
            return true;
        }
        if (!portfolioIdRef.current) {
            setSync('error');
            return false;
        }
        setSync('saving');
        try {
            await saveRemotePositions(createClient(), portfolioIdRef.current, clean);
            setSync('saved');
            return true;
        } catch (err) {
            console.warn('No se pudo guardar la cartera real en la cuenta:', err.message);
            setSync('error');
            return false;
        }
    }, [userId]);

    const current = positions ?? [];
    return {
        positions,
        user,
        enabled,
        sync,
        imported,
        retry: () => setReloadKey((k) => k + 1),
        importBroker: (broker, incoming) => commit(replaceBroker(current, broker, incoming)),
        add: (item) => commit(addPosition(current, item)),
        remove: (broker, symbol) => commit(removePosition(current, broker, symbol)),
        clear: () => commit([]),
    };
}
