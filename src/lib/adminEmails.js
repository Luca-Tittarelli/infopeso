// Cuentas con herramientas de prueba en /cuenta (por ejemplo, enviarse el resumen semanal a sí mismas).
// ADMIN_EMAILS (separados por coma) reemplaza la lista por defecto sin tocar el código.
const DEFAULT_ADMINS = ['lucatitta19@gmail.com'];

const admins = (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : DEFAULT_ADMINS)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// El email debe venir de la sesión del servidor (getUser), nunca de un campo del formulario.
export const isAdminEmail = (email) => typeof email === 'string' && admins.includes(email.trim().toLowerCase());
