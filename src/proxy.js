import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/session';

// Secciones con mayúscula en la URL real. Como las rutas distinguen mayúsculas, /rentafija/gd30 o /empresas daban 404
// (Google llegó a marcar /RentaFija/gd30 como soft 404). Acá se redirigen con 308 a la forma canónica.
// `rest` normaliza el resto de la ruta: los bonos van en mayúscula (AL30) y los cambios/variables en minúscula
// (dolar-blue). Las fichas de empresas ya resuelven el símbolo sin importar mayúsculas y declaran su canonical.
const SECTIONS = {
    cambios: { name: 'Cambios', rest: (s) => s.toLowerCase() },
    economia: { name: 'Economia', rest: (s) => s.toLowerCase() },
    empresas: { name: 'Empresas', rest: (s) => s },
    mercado: { name: 'Mercado', rest: (s) => s },
    rentafija: { name: 'RentaFija', rest: (s) => s.toUpperCase() },
    cartera: { name: 'Cartera', rest: (s) => s },
};

// Las calculadoras viven dentro de /Cambios con slug en minúscula, así que la regla de `cambios` también las cubre.
function canonicalPath(pathname) {
    const [, first = '', ...rest] = pathname.split('/');
    const section = SECTIONS[first.toLowerCase()];
    if (!section) return null;
    const restPath = rest.join('/');
    const canonical = `/${section.name}${restPath ? `/${section.rest(restPath)}` : ''}`;
    return canonical === pathname ? null : canonical;
}

const SESSION_PATHS = ['/cuenta', '/actualizar-clave', '/ingresar', '/registro', '/recuperar-clave'];

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // La comparación es exacta: /cartera va a /Cartera y /Cartera pasa intacta.
    const canonical = canonicalPath(pathname);
    if (canonical) {
        const url = request.nextUrl.clone();
        url.pathname = canonical;
        return NextResponse.redirect(url, 308);
    }

    if (SESSION_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return updateSession(request);
    return NextResponse.next();
}

// El matcher sí distingue mayúsculas (/rentafija/:path* no atrapa /RentaFija/gd30), así que corre en todas las páginas
// y el filtro se hace en código. Quedan afuera _next, la API y los archivos estáticos; los símbolos con punto
// (/Empresas/TGSU2.BA) sí pasan.
export const config = {
    matcher: ['/((?!_next/|api/|.*\\.(?:png|jpe?g|gif|svg|ico|webp|xml|txt|js|css|json|map|woff2?)$).*)'],
};
