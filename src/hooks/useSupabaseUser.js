'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { trackAccountLinked } from '@/lib/track';

// Estado de sesión para la UI. Lee la sesión local (sin ir a la red) y escucha cambios de login/logout.
// Solo sirve para mostrar u ocultar interfaz: la autorización real la hace la base con RLS.
export function useSupabaseUser() {
    // Sin Supabase configurado no hay nada que esperar: se arranca ya "listo" y sin usuario.
    const [state, setState] = useState({ user: null, ready: !isSupabaseConfigured });
    const pathname = usePathname();

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;

        // Dispara INITIAL_SESSION al suscribirse. No llamar a otras funciones de supabase dentro del callback.
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({ user: session?.user ?? null, ready: true });
            if (session?.user) trackAccountLinked(session.user.id);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    // Iniciar o cerrar sesión con una acción del servidor cambia la cookie sin recargar la página, y el cliente del
    // navegador no se entera: el encabezado seguiría mostrando "Ingresar". Al cambiar de ruta se relee la sesión
    // guardada en las cookies (sin ir a la red) y solo se actualiza el estado si el usuario cambió.
    useEffect(() => {
        const supabase = createClient();
        if (!supabase) return;
        let alive = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!alive) return;
            const user = data.session?.user ?? null;
            if (user) trackAccountLinked(user.id);
            setState((s) => (s.ready && (s.user?.id ?? null) === (user?.id ?? null) ? s : { user, ready: true }));
        });
        return () => { alive = false; };
    }, [pathname]);

    return { ...state, enabled: isSupabaseConfigured };
}
