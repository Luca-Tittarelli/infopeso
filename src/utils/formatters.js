/**
 * Infopeso Pulso — Formato de datos (Argentina es-AR)
 * Reglas del manual de marca:
 * - Miles con punto y decimales con coma: 1.234,50 (Intl.NumberFormat('es-AR'))
 * - Moneda: "$ 1.234,50" para pesos y "US$ 1.234,50" para dólares (con espacio)
 * - Porcentaje: "+2,15 %" y "−0,80 %" (signo menos real U+2212 y espacio antes de %)
 * - Riesgo país: "1.234 pb"
 * - Si no hay dato, mostrar "—". Nunca mostrar 0, NaN ni valor inventado.
 */

export const MINUS_SIGN = '\u2212'; // −

export function isValidNumber(val) {
    if (val === null || val === undefined || val === '') return false;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n);
}

export function formatNumber(val, { minimumFractionDigits = 2, maximumFractionDigits = 2 } = {}) {
    if (!isValidNumber(val)) return '—';
    const n = Number(val);
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(n);
}

export function formatInteger(val) {
    if (!isValidNumber(val)) return '—';
    const n = Number(val);
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

export function formatCompactNumber(val) {
    if (!isValidNumber(val)) return '—';
    const n = Number(val);
    const abs = Math.abs(n);
    if (abs >= 1_000_000_000) {
        return `${formatNumber(n / 1_000_000_000, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil M`;
    }
    if (abs >= 1_000_000) {
        return `${formatNumber(n / 1_000_000, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} M`;
    }
    return formatNumber(n, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function formatCurrency(val, currency = 'ARS', decimals) {
    if (!isValidNumber(val)) return '—';
    const n = Number(val);
    if (n === 0) return '—';
    const prefix = currency === 'USD' || currency === 'U$S' || currency === 'US$' ? 'US$' : currency === 'EUR' ? 'EUR' : currency === 'BRL' ? 'R$' : '$';
    const minDec = decimals !== undefined ? decimals : (n % 1 === 0 ? 0 : 2);
    const maxDec = decimals !== undefined ? decimals : 2;
    const formatted = formatNumber(n, { minimumFractionDigits: minDec, maximumFractionDigits: maxDec });
    return `${prefix} ${formatted}`;
}

export function formatDeltaText(val, { unit = '%', decimals = 2 } = {}) {
    if (!isValidNumber(val)) return '—';
    const n = Number(val);
    const absFormatted = formatNumber(Math.abs(n), {
        minimumFractionDigits: unit === 'pb' ? 0 : decimals,
        maximumFractionDigits: unit === 'pb' ? 0 : decimals,
    });
    const suffix = unit ? ` ${unit}` : '';
    if (n > 0) return `+${absFormatted}${suffix}`;
    if (n < 0) return `${MINUS_SIGN}${absFormatted}${suffix}`;
    return `= ${absFormatted}${suffix}`;
}

export function formatDeltaAriaLabel(val, { unit = '%', decimals = 2 } = {}) {
    if (!isValidNumber(val)) return 'sin datos';
    const n = Number(val);
    const absFormatted = formatNumber(Math.abs(n), {
        minimumFractionDigits: unit === 'pb' ? 0 : decimals,
        maximumFractionDigits: unit === 'pb' ? 0 : decimals,
    });
    const unitWords = unit === 'pb' ? 'puntos básicos' : unit === 'pp' ? 'puntos porcentuales' : 'por ciento';
    if (n > 0) return `sube ${absFormatted} ${unitWords}`;
    if (n < 0) return `baja ${absFormatted} ${unitWords}`;
    return 'sin cambios';
}

export function formatUpdatedTime(fecha, { delayed = false } = {}) {
    if (!fecha) return delayed ? 'DIFERIDO' : 'ACTUALIZADO HOY';
    try {
        const d = new Date(fecha);
        if (Number.isNaN(d.getTime())) {
            return `ACTUALIZADO ${String(fecha).toUpperCase()}`;
        }
        // Check if fecha has a time component or is YYYY-MM-DD
        const isDateOnly = typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha.trim());
        if (isDateOnly) {
            const [y, m, day] = fecha.trim().split('-');
            return `ACTUALIZADO ${day}/${m}/${y.slice(-2)}${delayed ? ' · DIFERIDO' : ''}`;
        }
        const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `ACTUALIZADO ${timeStr}${delayed ? ' · DIFERIDO' : ''}`;
    } catch {
        return 'ACTUALIZADO HOY';
    }
}
