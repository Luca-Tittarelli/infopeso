import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

// Clave secreta de Supabase: se salta RLS. Solo se usa en rutas de servidor (cron, eventos) y NUNCA
// lleva prefijo NEXT_PUBLIC_. Si falta, las funciones que la necesitan quedan apagadas sin romper el sitio.
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const isAdminConfigured = Boolean(SUPABASE_URL && SECRET_KEY);

export function createAdminClient() {
    if (!isAdminConfigured) throw new Error('SUPABASE_SECRET_KEY no está configurada');
    return createSupabaseClient(SUPABASE_URL, SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
}
