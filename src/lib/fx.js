import { dolarAPI, cotizacionesAPI } from '@/apis';

async function getJson(url, revalidate) {
    try {
        const res = await fetch(url, { next: { revalidate } });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export const getDolares = () => getJson(dolarAPI, 60);
export const getCotizaciones = () => getJson(cotizacionesAPI, 60);

// Histórico completo desde ArgentinaDatos: dólares por casa, euro y real por moneda
export function getHistory(meta) {
    const url = meta.moneda
        ? `https://api.argentinadatos.com/v1/cotizaciones/${meta.moneda.toLowerCase()}`
        : `https://api.argentinadatos.com/v1/cotizaciones/dolares/${meta.casa}`;
    return getJson(url, 3600);
}

// Cotización actual de la ficha (dólar por casa, otras monedas por código)
export function pickQuote(meta, dolares, cotizaciones) {
    if (meta.moneda) return cotizaciones?.find((c) => c.moneda === meta.moneda && c.casa === 'oficial') || null;
    return dolares?.find((d) => d.casa === meta.casa) || null;
}

// Último registro del histórico con fecha igual o anterior a la de hace `months` meses
export function valueMonthsAgo(history, months) {
    if (!Array.isArray(history) || history.length === 0) return null;
    const target = new Date();
    target.setMonth(target.getMonth() - months);
    const iso = target.toISOString().slice(0, 10);
    let found = null;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].fecha <= iso) { found = history[i]; break; }
    }
    return found;
}

export const fmtARS = (n, digits = 2) =>
    typeof n === 'number' ? n.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '—';
