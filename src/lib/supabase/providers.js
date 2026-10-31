import 'server-only';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from './config';

// Consulta qué proveedores de login tiene habilitados el proyecto de Supabase (endpoint público de ajustes).
// Así el botón de Google aparece solo cuando está configurado en el panel, sin variables extra ni botones muertos.
export async function getEnabledProviders() {
    if (!isSupabaseConfigured) return { google: false };

    try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
            next: { revalidate: 300 },
            signal: AbortSignal.timeout(3000),
        });
        if (!res.ok) return { google: false };
        const settings = await res.json();
        return { google: Boolean(settings?.external?.google) };
    } catch {
        return { google: false };
    }
}
