// Valuación de la cartera real: junta las posiciones de todos los brokers, las valúa con la cotización
// de hoy y calcula porcentajes. Módulo puro (sin React ni red).
//
// Regla clave para varios brokers: se SUMAN CANTIDADES por ticker y se valúan con un único precio.
// Nunca se promedian porcentajes de cada archivo.

export const FIXED_INCOME = new Set(['bond', 'note', 'corp']);

export const KIND_LABELS = {
    stock: 'Acciones',
    cedear: 'CEDEARs',
    bond: 'Bonos',
    note: 'Letras',
    corp: 'Obligaciones negociables',
    fund: 'Fondos',
    cash: 'Efectivo',
    other: 'Otros',
};

const KIND_ORDER = ['stock', 'cedear', 'bond', 'note', 'corp', 'fund', 'other', 'cash'];

// Los bonos, letras y ON cotizan cada 100 de valor nominal.
export const unitValue = (kind, price) => (FIXED_INCOME.has(kind) ? price / 100 : price);

const toARS = (amount, currency, mep) => (currency === 'USD' ? amount * mep : amount);

// Valor de una posición en su moneda y en pesos. `quote` = { price, pct, currency } o undefined.
export function valuePosition(position, quote, mep) {
    const qty = Number(position.quantity) || 0;

    if (position.kind === 'cash') {
        return { native: qty, currency: position.currency, ars: toARS(qty, position.currency, mep), priced: true, dayChangeARS: null };
    }
    if (quote && Number.isFinite(quote.price)) {
        const native = qty * unitValue(position.kind, quote.price);
        const ars = toARS(native, quote.currency, mep);
        const pct = Number.isFinite(quote.pct) ? quote.pct : null;
        const dayChangeARS = pct !== null && pct > -100 ? ars - ars / (1 + pct / 100) : null;
        return { native, currency: quote.currency, ars, priced: true, dayChangeARS };
    }
    if (Number.isFinite(position.fileValue)) {
        return { native: position.fileValue, currency: position.currency, ars: toARS(position.fileValue, position.currency, mep), priced: false, dayChangeARS: null };
    }
    return { native: 0, currency: position.currency, ars: 0, priced: false, dayChangeARS: null };
}

// Junta posiciones de todos los brokers por ticker y calcula totales, pesos y distribución.
export function summarize(positions, quotes = {}, mep = null) {
    const rate = Number.isFinite(mep) && mep > 0 ? mep : null;
    const bySymbol = new Map();

    for (const original of positions) {
        const quote = quotes[original.symbol];
        // El tipo vigente lo define la cotización de hoy (el guardado puede ser de una importación vieja).
        const p = quote && original.kind !== 'cash' ? { ...original, kind: quote.kind } : original;
        // Sin dólar MEP no se puede convertir USD → ARS: esas posiciones quedan sin valuar en vez de mal valuadas.
        const needsRate = p.currency === 'USD' || quote?.currency === 'USD';
        const v = needsRate && !rate ? { native: 0, currency: 'USD', ars: 0, priced: false, dayChangeARS: null } : valuePosition(p, quote, rate ?? 1);

        const h = bySymbol.get(p.symbol) ?? {
            symbol: p.symbol, kind: p.kind, currency: v.currency, quantity: 0, valueARS: 0, native: 0,
            priced: true, dayChangeARS: 0, hasDayChange: false, brokers: [], pct: quote?.pct ?? null, price: quote?.price ?? null,
            costTotal: 0, costQty: 0, costComplete: true,
        };
        h.quantity += Number(p.quantity) || 0;
        h.valueARS += v.ars;
        h.native += v.native;
        h.priced = h.priced && v.priced;
        if (v.dayChangeARS !== null) { h.dayChangeARS += v.dayChangeARS; h.hasDayChange = true; }
        h.brokers.push({ broker: p.broker, quantity: Number(p.quantity) || 0, valueARS: v.ars });
        if (Number.isFinite(p.avgCost) && p.avgCost > 0) { h.costTotal += p.avgCost * p.quantity; h.costQty += p.quantity; } else h.costComplete = false;
        bySymbol.set(p.symbol, h);
    }

    const holdings = [...bySymbol.values()];
    const totalARS = holdings.reduce((s, h) => s + h.valueARS, 0);
    const dayChangeARS = holdings.reduce((s, h) => s + (h.hasDayChange ? h.dayChangeARS : 0), 0);
    const pricedARS = holdings.filter((h) => h.priced).reduce((s, h) => s + h.valueARS, 0);

    for (const h of holdings) {
        h.weight = totalARS > 0 ? (h.valueARS / totalARS) * 100 : 0;
        // Ganancia/pérdida solo para acciones y CEDEARs con precio de compra en todos los brokers (en renta fija las convenciones de costo varían).
        const avgCost = h.costComplete && h.costQty > 0 ? h.costTotal / h.costQty : null;
        const comparable = avgCost !== null && h.price !== null && !FIXED_INCOME.has(h.kind) && h.kind !== 'cash' && h.kind !== 'other';
        h.avgCost = avgCost;
        h.pnlPct = comparable ? (h.price / avgCost - 1) * 100 : null;
        h.pnlNative = comparable ? (h.price - avgCost) * h.quantity : null;
    }
    holdings.sort((a, b) => b.valueARS - a.valueARS);

    const byKind = {};
    const byCurrency = { ARS: 0, USD: 0 };
    for (const h of holdings) {
        byKind[h.kind] = (byKind[h.kind] ?? 0) + h.valueARS;
        byCurrency[h.currency === 'USD' ? 'USD' : 'ARS'] += h.valueARS;
    }
    const kinds = KIND_ORDER.filter((k) => byKind[k] > 0).map((k) => ({
        kind: k, label: KIND_LABELS[k], valueARS: byKind[k], weight: totalARS > 0 ? (byKind[k] / totalARS) * 100 : 0,
    }));

    const prevTotal = totalARS - dayChangeARS;
    return {
        holdings,
        totalARS,
        totalUSD: rate ? totalARS / rate : null,
        mep: rate,
        dayChangeARS,
        dayChangePct: prevTotal > 0 && dayChangeARS !== 0 ? (dayChangeARS / prevTotal) * 100 : null,
        kinds,
        usdShare: totalARS > 0 ? (byCurrency.USD / totalARS) * 100 : 0,
        pricedShare: totalARS > 0 ? (pricedARS / totalARS) * 100 : 100,
        unpriced: holdings.filter((h) => !h.priced).map((h) => h.symbol),
    };
}

// Hasta tres avisos en lenguaje simple. Son datos objetivos de la cartera, no recomendaciones.
export function buildAlerts(summary, earnings = {}) {
    const alerts = [];
    const { holdings } = summary;
    if (holdings.length === 0) return alerts;

    const top = holdings.find((h) => h.kind !== 'cash');
    if (top && top.weight >= 30 && holdings.length > 1) {
        alerts.push({
            id: 'concentracion',
            title: `${top.symbol} es el ${Math.round(top.weight)} % de tu cartera`,
            text: `Si ${top.symbol} cae 10 %, tu cartera baja cerca de ${(top.weight / 10).toFixed(1).replace('.', ',')} %.`,
        });
    }

    const mover = holdings
        .filter((h) => Number.isFinite(h.pct) && Math.abs(h.pct) >= 4 && h.weight >= 3)
        .sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))[0];
    if (mover) {
        alerts.push({
            id: 'movimiento',
            title: `${mover.symbol} ${mover.pct > 0 ? 'sube' : 'baja'} ${Math.abs(mover.pct).toFixed(1).replace('.', ',')} % hoy`,
            text: `Pesa ${Math.round(mover.weight)} % de tu cartera.`,
        });
    }

    const soon = holdings
        .map((h) => ({ h, date: earnings[h.symbol] }))
        .filter(({ date }) => date && date >= Date.now() && date - Date.now() <= 14 * 86400000)
        .sort((a, b) => a.date - b.date)[0];
    if (soon) {
        alerts.push({
            id: 'resultados',
            title: `${soon.h.symbol} presenta resultados el ${new Date(soon.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`,
            text: 'Suele haber más movimiento en el precio alrededor de esa fecha.',
        });
    }

    if (summary.unpriced.length > 0) {
        alerts.push({
            id: 'sin-precio',
            title: `${summary.unpriced.length} ${summary.unpriced.length === 1 ? 'activo no tiene' : 'activos no tienen'} precio en vivo`,
            text: `${summary.unpriced.join(', ')}: se valúan con el monto que trae el archivo del broker.`,
        });
    }

    return alerts.slice(0, 3);
}
