import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from './config';

// Cliente para componentes de navegador. @supabase/ssr devuelve siempre la misma instancia.
export function createClient() {
    if (!isSupabaseConfigured) return null;
    return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
