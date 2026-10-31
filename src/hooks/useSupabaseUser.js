'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// Estado de sesión para la UI. Lee la sesión local (sin ir a la red) y escucha cambios de login/logout.
// Solo sirve para mostrar u ocultar interfaz: la autorización real la hace la base con RLS.
export function useSupabaseUser() {
    // Sin Supabase configurado no hay nada que esperar: se arranca ya "listo" y sin usuario.
    const [state, setState] = useState({ user: null, ready: !isSupabaseConfigured });

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        // Dispara INITIAL_SESSION al suscribirse. No llamar a otras funciones de supabase dentro del callback.
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({ user: session?.user ?? null, ready: true });
        });
        return () => data.subscription.unsubscribe();
    }, []);

    return { ...state, enabled: isSupabaseConfigured };
}
