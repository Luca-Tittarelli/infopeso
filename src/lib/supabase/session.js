import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from './config';

// Rutas que exigen sesión y rutas que no tienen sentido estando logueado.
const PROTECTED = ['/cuenta', '/actualizar-clave'];
const GUEST_ONLY = ['/ingresar', '/registro', '/recuperar-clave'];

const matches = (pathname, list) => list.some((p) => pathname === p || pathname.startsWith(`${p}/`));

function redirectWithCookies(request, pathname, search, source) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const redirect = NextResponse.redirect(url);
    // Conserva los tokens renovados en la respuesta original.
    source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
}

// Renueva la sesión de Supabase en cada request que pasa por el proxy y aplica chequeos optimistas.
// La autorización real de los datos vive en la base (RLS) y en el DAL, no acá.
export async function updateSession(request) {
    let response = NextResponse.next({ request });
    if (!isSupabaseConfigured) return response;

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                response = NextResponse.next({ request });
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
        },
    });

    // getClaims valida la firma del JWT y renueva el token si está por vencer.
    const { data } = await supabase.auth.getClaims();
    const isAuthenticated = Boolean(data?.claims);
    const { pathname } = request.nextUrl;

    if (!isAuthenticated && matches(pathname, PROTECTED)) {
        const next = encodeURIComponent(`${pathname}${request.nextUrl.search}`);
        return redirectWithCookies(request, '/ingresar', `?next=${next}`, response);
    }

    if (isAuthenticated && matches(pathname, GUEST_ONLY)) {
        return redirectWithCookies(request, '/cuenta', '', response);
    }

    return response;
}
