// Solo se aceptan rutas internas: evita redirecciones abiertas a sitios externos.
export function safeNext(value, fallback = '/cuenta') {
    if (typeof value !== 'string') return fallback;
    if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
    return value;
}
