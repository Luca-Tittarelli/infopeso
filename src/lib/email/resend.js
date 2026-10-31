import 'server-only';

// Envío por la API de Resend con fetch (sin dependencias). RESEND_API_BASE existe para probar contra un mock local.
const API_BASE = (process.env.RESEND_API_BASE || 'https://api.resend.com').replace(/\/$/, '');
const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM;
const BATCH_SIZE = 100;

export const isEmailConfigured = Boolean(API_KEY && FROM);

// messages: [{ to, subject, html, text, headers }]. Devuelve { sent, failed }.
// idempotencyKey: si el mismo lote se envía dos veces (por ejemplo, el cron se ejecuta de nuevo), Resend lo deduplica por 24 h.
export async function sendBatch(messages, idempotencyKey) {
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
        const chunk = messages.slice(i, i + BATCH_SIZE);
        try {
            const res = await fetch(`${API_BASE}/emails/batch`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    ...(idempotencyKey && { 'Idempotency-Key': `${idempotencyKey}-${i / BATCH_SIZE}` }),
                },
                body: JSON.stringify(chunk.map((m) => ({ from: FROM, to: [m.to], subject: m.subject, html: m.html, text: m.text, headers: m.headers }))),
            });
            if (res.ok) sent += chunk.length;
            else {
                failed += chunk.length;
                console.warn('Resend rechazó un lote de mails:', res.status);
            }
        } catch (err) {
            failed += chunk.length;
            console.warn('No se pudo contactar a Resend:', err.message);
        }
    }
    return { sent, failed };
}
