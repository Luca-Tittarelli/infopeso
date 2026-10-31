import 'server-only';
import { SITE_URL, signUnsubscribe } from './unsubscribe';

// Mails del resumen semanal y de bienvenida. HTML con estilos en línea (los clientes de mail no leen CSS externo),
// en la paleta clara de Pulso, sin imágenes ni emojis.

const INK = '#141210';
const MUTED = '#4F4840';
const SUBTLE = '#6E665C';
const GROUND = '#F1ECE4';
const SURFACE = '#FBF8F3';
const LINE = '#D9D0C2';
const SIGNAL = '#D9461A';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (n, d = 0) => n.toLocaleString('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d });
const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(Math.abs(n), 1)} %`;
const usd = (n) => `US$ ${fmt(n)}`;
const ars = (n) => `$ ${fmt(n)}`;
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'UTC' });

const cartera = `${SITE_URL}/Cartera?ref=resumen`;

function listHeaders(userId) {
    const url = `${SITE_URL}/api/email/baja?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(signUnsubscribe(userId))}`;
    return { 'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' };
}

const bajaLink = (userId) => `${SITE_URL}/baja?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(signUnsubscribe(userId))}`;

function layout({ preheader, title, bodyHtml, userId }) {
    return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:${GROUND};color:${INK};font-family:Helvetica,Arial,sans-serif;line-height:1.55">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${GROUND}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SURFACE};border:1px solid ${LINE};border-radius:14px"><tr><td style="padding:28px 24px">
<p style="margin:0 0 20px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${SIGNAL};font-weight:700">Infopeso</p>
${bodyHtml}
<p style="margin:28px 0 0"><a href="${cartera}" style="display:inline-block;background:${SIGNAL};color:${INK};text-decoration:none;font-weight:700;padding:14px 24px;border-radius:999px">Ver mi cartera</a></p>
</td></tr></table>
<p style="max-width:560px;margin:16px 0 0;font-size:12px;color:${SUBTLE};text-align:left">
Información con fines informativos, no es una recomendación de inversión. Los valores usan precios de BYMA y el dólar MEP del cierre.<br>
Recibís este mail porque tenés una cartera cargada en Infopeso. <a href="${bajaLink(userId)}" style="color:${MUTED}">Dejar de recibirlo</a> o cambiarlo desde <a href="${SITE_URL}/cuenta" style="color:${MUTED}">tu cuenta</a>.
</p>
</td></tr></table></body></html>`;
}

const bigNumber = (text) => `<p style="margin:0;font-size:34px;line-height:1.1;font-weight:700;letter-spacing:-.02em">${esc(text)}</p>`;
const label = (text) => `<p style="margin:0 0 4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${SUBTLE}">${esc(text)}</p>`;
const line = (html) => `<p style="margin:12px 0 0;font-size:15px;color:${MUTED}">${html}</p>`;

// digest = salida de weeklyDigest()
export function buildDigestEmail({ digest, userId }) {
    const hasUsd = digest.performanceUSDPct !== null && digest.totalUSD !== null;
    const perf = hasUsd ? digest.performanceUSDPct : digest.performanceARSPct;
    const cur = hasUsd ? 'en dólares' : 'en pesos';
    const total = hasUsd ? usd(digest.totalUSD) : ars(digest.totalARS);
    const valueChange = hasUsd ? digest.valueChangeUSDPct : digest.valueChangeARSPct;

    const subject = perf !== null ? `Tu cartera esta semana: ${signed(perf)} ${cur}` : 'Tu resumen semanal de Infopeso';
    const lines = [];
    const plain = [];

    if (perf !== null) {
        lines.push(line(`Lo que ya tenías el ${esc(longDate(digest.from))} rindió <strong style="color:${INK}">${esc(signed(perf))}</strong> ${cur}.`));
        plain.push(`Lo que ya tenías el ${longDate(digest.from)} rindió ${signed(perf)} ${cur}.`);
    }
    if (digest.best) {
        lines.push(line(`Más subió: <strong style="color:${INK}">${esc(digest.best.symbol)}</strong> (${esc(signed(digest.best.pct))}).`));
        plain.push(`Más subió: ${digest.best.symbol} (${signed(digest.best.pct)}).`);
    }
    if (digest.worst) {
        lines.push(line(`Más bajó: <strong style="color:${INK}">${esc(digest.worst.symbol)}</strong> (${esc(signed(digest.worst.pct))}).`));
        plain.push(`Más bajó: ${digest.worst.symbol} (${signed(digest.worst.pct)}).`);
    }
    if (valueChange !== null) {
        lines.push(`<p style="margin:12px 0 0;font-size:13px;color:${SUBTLE}">El valor total cambió ${esc(signed(valueChange))} en ${digest.days} días; incluye lo que hayas sumado o retirado.</p>`);
        plain.push(`El valor total cambió ${signed(valueChange)} en ${digest.days} días; incluye lo que hayas sumado o retirado.`);
    }

    const html = layout({
        preheader: subject,
        title: subject,
        userId,
        bodyHtml: `${label('Tu cartera hoy')}${bigNumber(total)}${lines.join('')}`,
    });
    const text = [`Tu cartera hoy: ${total}`, ...plain, '', `Ver mi cartera: ${cartera}`, '', 'No es una recomendación de inversión.', `Dejar de recibir este mail: ${bajaLink(userId)}`].join('\n');
    return { subject, html, text, headers: listHeaders(userId) };
}

// Primer viernes con una sola foto: todavía no hay con qué comparar.
export function buildWelcomeEmail({ snapshot, userId }) {
    const hasUsd = snapshot.total_usd !== null && snapshot.total_usd !== undefined;
    const total = hasUsd ? usd(Number(snapshot.total_usd)) : ars(Number(snapshot.total_ars));
    const subject = 'Ya estamos registrando la evolución de tu cartera';
    const body = `Desde hoy guardamos el valor de tu cartera cada día hábil. En los próximos viernes vas a ver cuánto rindió lo que tenés y qué activo se movió más.`;
    const html = layout({
        preheader: subject,
        title: subject,
        userId,
        bodyHtml: `${label('Tu cartera hoy')}${bigNumber(total)}${line(esc(body))}`,
    });
    const text = [`Tu cartera hoy: ${total}`, body, '', `Ver mi cartera: ${cartera}`, '', 'No es una recomendación de inversión.', `Dejar de recibir este mail: ${bajaLink(userId)}`].join('\n');
    return { subject, html, text, headers: listHeaders(userId) };
}
