import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createAdminClient, isAdminConfigured } from '@/lib/supabase/admin';

export const SITE_URL = (process.env.SITE_URL || 'https://www.infopeso.com.ar').replace(/\/$/, '');

const SECRET = process.env.EMAIL_UNSUBSCRIBE_SECRET;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUnsubscribeConfigured = Boolean(SECRET);

// Firma del link de baja: solo quien recibió el mail puede darse de baja, sin iniciar sesión.
export function signUnsubscribe(userId) {
    return createHmac('sha256', SECRET).update(`baja:${userId}`).digest('base64url');
}

export function verifyUnsubscribe(userId, token) {
    if (!SECRET || !UUID_RE.test(String(userId)) || typeof token !== 'string' || !token) return false;
    const expected = Buffer.from(signUnsubscribe(userId));
    const given = Buffer.from(token);
    return expected.length === given.length && timingSafeEqual(expected, given);
}

// Apaga el resumen semanal con la clave de servidor (quien da la baja desde el mail no tiene sesión). Devuelve true si se aplicó.
export async function unsubscribeUser(userId, token) {
    if (!verifyUnsubscribe(userId, token) || !isAdminConfigured) return false;
    const { error } = await createAdminClient().from('profiles').update({ weekly_email: false }).eq('id', userId);
    if (error) {
        console.warn('No se pudo dar de baja el resumen semanal:', error.message);
        return false;
    }
    return true;
}
