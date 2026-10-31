import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';

// Cliente para Server Components, Server Actions y Route Handlers (lee y escribe la cookie de sesión).
export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                } catch {
                    // Desde un Server Component no se pueden escribir cookies: el proxy ya refresca la sesión.
                }
            },
        },
    });
}
