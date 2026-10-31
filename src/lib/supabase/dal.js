import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from './server';
import { isSupabaseConfigured } from './config';

// Capa de acceso a datos: toda autorización del lado del servidor pasa por acá.
// getUser() valida el token contra Supabase Auth (a diferencia de leer la cookie a ciegas).
export const getCurrentUser = cache(async () => {
    if (!isSupabaseConfigured) return null;
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
});

export async function requireUser(returnTo = '/cuenta') {
    const user = await getCurrentUser();
    if (!user) redirect(`/ingresar?next=${encodeURIComponent(returnTo)}`);
    return user;
}
