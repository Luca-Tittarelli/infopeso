import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/session';

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // El matcher de Next no distingue mayúsculas, así que /Cartera (la página real) también entra acá.
    // La comparación en código sí es exacta: /cartera va a /Cartera y /Cartera pasa intacta.
    if (pathname === '/cartera') {
        const url = request.nextUrl.clone();
        url.pathname = '/Cartera';
        return NextResponse.redirect(url, 308);
    }
    if (pathname === '/Cartera') return NextResponse.next();

    return updateSession(request);
}

// Solo corre donde hay sesión en juego: el resto del sitio (páginas públicas y cacheadas) no se toca.
export const config = {
    matcher: ['/cartera', '/cuenta/:path*', '/actualizar-clave', '/ingresar', '/registro', '/recuperar-clave'],
};
