// Fotos diarias de la cartera y resumen semanal. Módulo puro (sin React, red ni base de datos).
//
// Una foto guarda cuánto valía la cartera ese día (en pesos y en dólares MEP) y el detalle por activo.
// Con dos fotos se puede decir cuánto cambió el valor y qué activos se movieron.

const AR_OFFSET_MS = 3 * 3600 * 1000; // Argentina es UTC-3 todo el año (sin horario de verano)
const DAY_MS = 86400000;

const round = (n, d) => {
    const f = 10 ** d;
    return Math.round(n * f) / f;
};

// Fecha "YYYY-MM-DD" en hora de Argentina.
export const arDate = (now = new Date()) => new Date(now.getTime() - AR_OFFSET_MS).toISOString().slice(0, 10);

// 0 = domingo … 6 = sábado, en hora de Argentina.
export const arWeekday = (now = new Date()) => new Date(now.getTime() - AR_OFFSET_MS).getUTCDay();

const dayNumber = (isoDate) => Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS);
export const daysBetween = (fromIso, toIso) => dayNumber(toIso) - dayNumber(fromIso);

// Fila para la tabla portfolio_snapshots a partir de summarize(). Devuelve null si no hay nada que guardar.
export function toSnapshotRow(summary, date, portfolioId) {
    if (!summary || !(summary.totalARS > 0)) return null;
    return {
        portfolio_id: portfolioId,
        snap_date: date,
        total_ars: round(summary.totalARS, 2),
        total_usd: summary.totalUSD !== null && Number.isFinite(summary.totalUSD) ? round(summary.totalUSD, 2) : null,
        mep: summary.mep ? round(summary.mep, 4) : null,
        priced_share: round(Math.min(100, Math.max(0, summary.pricedShare)), 2),
        holdings: summary.holdings.map((h) => ({
            symbol: h.symbol,
            kind: h.kind,
            quantity: round(h.quantity, 8),
            price: Number.isFinite(h.price) ? round(h.price, 4) : null,
            value_ars: round(h.valueARS, 2),
            weight: round(h.weight, 2),
        })),
    };
}

const num = (v) => (v === null || v === undefined ? null : Number(v));
const pctChange = (from, to) => (from > 0 && Number.isFinite(to) ? (to / from - 1) * 100 : null);

// Foto contra la que se compara: la última de hace 7 días o más; si no hay, la más antigua.
export function pickBase(snapshots, last) {
    const target = last.snap_date;
    const older = snapshots.filter((s) => daysBetween(s.snap_date, target) >= 7);
    if (older.length) return older[older.length - 1];
    const first = snapshots[0];
    return first && first.snap_date !== target ? first : null;
}

// Resumen semanal. `snapshots` son filas de portfolio_snapshots ordenadas de la más vieja a la más nueva.
// Devuelve null si hay menos de dos fotos.
//
// valueChange*: cambio del valor total (incluye lo que el usuario sumó o retiró).
// performance*: qué pasó con lo que ya tenía en las dos fotos, a cantidades constantes (no cuenta compras ni ventas).
export function weeklyDigest(snapshots) {
    if (!Array.isArray(snapshots) || snapshots.length < 2) return null;
    const last = snapshots[snapshots.length - 1];
    const base = pickBase(snapshots, last);
    if (!base) return null;

    const lastBySymbol = new Map((last.holdings ?? []).map((h) => [h.symbol, h]));
    const lastMep = num(last.mep);
    const baseMep = num(base.mep);

    let commonBaseARS = 0;
    let commonConstARS = 0;
    let commonBaseUSD = 0;
    let commonConstUSD = 0;
    const moves = [];

    for (const b of base.holdings ?? []) {
        const l = lastBySymbol.get(b.symbol);
        if (!l || !(b.quantity > 0) || !(l.quantity > 0)) continue;
        // Valor en pesos de las cantidades de la foto vieja, a precios de la foto nueva.
        const constARS = b.quantity * (l.value_ars / l.quantity);
        commonBaseARS += b.value_ars;
        commonConstARS += constARS;
        if (baseMep && lastMep) {
            commonBaseUSD += b.value_ars / baseMep;
            commonConstUSD += constARS / lastMep;
        }
        // Variación del precio en su propia moneda (efectivo y activos sin precio no entran).
        if (b.kind !== 'cash' && b.price > 0 && l.price > 0 && l.weight >= 2) {
            moves.push({ symbol: b.symbol, pct: pctChange(b.price, l.price), weight: l.weight });
        }
    }

    const valid = moves.filter((m) => Number.isFinite(m.pct));
    const best = valid.reduce((a, m) => (!a || m.pct > a.pct ? m : a), null);
    const worst = valid.reduce((a, m) => (!a || m.pct < a.pct ? m : a), null);

    return {
        from: base.snap_date,
        to: last.snap_date,
        days: daysBetween(base.snap_date, last.snap_date),
        totalARS: num(last.total_ars),
        totalUSD: num(last.total_usd),
        valueChangeARSPct: pctChange(num(base.total_ars), num(last.total_ars)),
        valueChangeUSDPct: num(base.total_usd) && num(last.total_usd) ? pctChange(num(base.total_usd), num(last.total_usd)) : null,
        performanceARSPct: commonBaseARS > 0 ? pctChange(commonBaseARS, commonConstARS) : null,
        performanceUSDPct: commonBaseUSD > 0 ? pctChange(commonBaseUSD, commonConstUSD) : null,
        best: best && best.pct > 0 ? best : null,
        worst: worst && worst.pct < 0 && worst.symbol !== best?.symbol ? worst : null,
    };
}

// Serie para el gráfico: [{ date, usd, ars }] ordenada por fecha.
export const toSeries = (snapshots) =>
    (snapshots ?? []).map((s) => ({ date: s.snap_date, usd: num(s.total_usd), ars: num(s.total_ars) }));

// Cambio entre dos puntos de la serie en la moneda pedida ('usd' | 'ars'), o null si falta algún dato.
export function seriesChangePct(series, currency, fromIndex = 0) {
    const pts = series.filter((p) => p[currency] !== null);
    if (pts.length < 2) return null;
    const from = pts[Math.max(0, Math.min(fromIndex, pts.length - 2))];
    return pctChange(from[currency], pts[pts.length - 1][currency]);
}
