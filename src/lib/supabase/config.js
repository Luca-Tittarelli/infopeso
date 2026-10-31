// Ambas variables son públicas por diseño: la seguridad real la dan las reglas RLS de la base.
// Nunca poner acá la clave secret / service_role ni la contraseña de la base.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Si faltan las variables el sitio sigue funcionando sin cuentas (cartera en localStorage).
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
