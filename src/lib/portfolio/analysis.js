// Análisis de las empresas de la cartera real con los datos de Yahoo Finance (ver src/lib/yahoo.js).
// Módulo puro (sin React ni red): recibe las tenencias ya valuadas y los fundamentals por símbolo.
//
// Todo se pondera por cuánto vale cada tenencia en pesos. Reglas para no mostrar promedios engañosos:
// - P/E y precio/valor libros con media armónica (es lo que se paga por el conjunto, no el promedio de múltiplos).
// - ROE y márgenes fuera de ±100 % quedan afuera (por ejemplo, recompras que achican el patrimonio).
// - Beta y potencial de analistas solo para las que cotizan en dólares: en las acciones locales la beta se mide
//   contra EE.UU. en pesos y los precios objetivo están en pesos (incluyen la inflación esperada).
// - El P/E futuro se descarta si difiere más de 4 veces del actual: en varias acciones locales Yahoo mezcla monedas.

import { getCompanyBySymbol } from '@/utils/carteraData';
import { formatNumber, MINUS_SIGN } from '@/utils/formatters';

const DAY = 86400000;
const RATIO_LIMIT = 100;
// Por debajo de esta cobertura (en % del valor analizado) un promedio no representa a la cartera.
const MIN_COVERAGE = 20;
const MIN_ANALYSTS = 3;
const EVENTS_DAYS = 90;

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const sumBy = (list, fn) => list.reduce((s, x) => s + fn(x), 0);
const fmt = (n, d = 1) => formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/^-/, MINUS_SIGN);
const listText = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`);

export const CONSENSUS_LABELS = { positive: 'Optimista', neutral: 'Neutral', negative: 'Pesimista' };

// Recomendación de Yahoo → consenso descriptivo. Es opinión de terceros, nunca una indicación de Infopeso.
export function consensusOf(key) {
    if (['strong_buy', 'strongBuy', 'buy'].includes(key)) return 'positive';
    if (key === 'hold') return 'neutral';
    if (['underperform', 'sell', 'strong_sell', 'strongSell'].includes(key)) return 'negative';
    return null;
}

const startOfDay = (now) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

// Promedio ponderado por valor de `pick(row)` entre las filas que pasan `accept`.
function weighted(rows, pick, { accept = () => true, harmonic = false } = {}) {
    const total = sumBy(rows, (r) => r.valueARS);
    let weight = 0;
    let acc = 0;
    const used = [];
    const excluded = [];
    for (const r of rows) {
        const v = pick(r);
        if (!finite(v)) continue;
        if (!accept(v, r)) { excluded.push(r.symbol); continue; }
        weight += r.valueARS;
        acc += harmonic ? r.valueARS / v : r.valueARS * v;
        used.push({ symbol: r.symbol, value: v });
    }
    const coverage = total > 0 ? (weight / total) * 100 : 0;
    if (weight === 0 || coverage < MIN_COVERAGE) return { value: null, coverage, excluded, min: null, max: null, count: used.length };
    used.sort((a, b) => a.value - b.value);
    return {
        value: harmonic ? weight / acc : acc / weight,
        coverage,
        excluded,
        min: used[0],
        max: used[used.length - 1],
        count: used.length,
    };
}

const positiveMultiple = (limit) => (v) => v > 0 && v < limit;
const withinRatioLimit = (v) => Math.abs(v) <= RATIO_LIMIT;
const coherentForwardPe = (v, r) => v > 0 && v < 250 && (!finite(r.pe) || r.pe <= 0 || (v / r.pe >= 0.25 && v / r.pe <= 4));

function buildRow(h, fundamentals, today) {
    const company = getCompanyBySymbol(h.catalogSymbol);
    const f = fundamentals[h.catalogSymbol];
    const d = f ?? {};
    const future = (iso) => {
        const t = iso ? new Date(iso).getTime() : NaN;
        return Number.isFinite(t) && t >= today ? t : null;
    };
    const { fiftyTwoWeekLow: low, fiftyTwoWeekHigh: high, price } = d;
    const range = finite(low) && finite(high) && finite(price) && high > low
        ? { low, high, position: Math.min(1, Math.max(0, (price - low) / (high - low))), fromHigh: (price / high - 1) * 100 }
        : null;

    return {
        symbol: h.symbol,
        catalogSymbol: h.catalogSymbol,
        name: company?.name ?? h.symbol,
        sector: company?.sector ?? 'Otros',
        local: company?.category === 'Argentina',
        valueARS: h.valueARS,
        portfolioWeight: h.weight,
        dayPct: finite(h.pct) ? h.pct : null,
        hasData: Boolean(f) && !f.error,
        currency: d.currency ?? null,
        usdListed: Boolean(d.currency) && d.currency !== 'ARS',
        price: finite(price) ? price : null,
        pe: d.pe ?? null,
        forwardPe: d.forwardPe ?? null,
        pb: d.priceToBook ?? null,
        roe: d.roe ?? null,
        operatingMargin: d.operatingMargin ?? null,
        profitMargin: d.profitMargin ?? null,
        dividendYield: finite(d.dividendYield) && d.dividendYield >= 0 && d.dividendYield <= 25 ? d.dividendYield : null,
        beta: d.beta ?? null,
        consensus: consensusOf(d.recommendationKey),
        analysts: d.numberOfAnalysts ?? 0,
        targetLow: d.targetLowPrice ?? null,
        targetMean: d.targetMeanPrice ?? null,
        targetHigh: d.targetHighPrice ?? null,
        upside: finite(d.upsidePotential) ? d.upsidePotential : null,
        range,
        nextEarnings: future(d.nextEarningsDate),
        exDividend: future(d.exDividendDate),
        dividendDate: future(d.dividendDate),
    };
}

function shares(rows, keyOf, total) {
    const map = new Map();
    for (const r of rows) {
        const k = keyOf(r);
        if (k === null || k === undefined) continue;
        map.set(k, (map.get(k) ?? 0) + r.valueARS);
    }
    return [...map.entries()]
        .map(([name, value]) => ({ name, valueARS: value, weight: total > 0 ? (value / total) * 100 : 0 }))
        .sort((a, b) => b.valueARS - a.valueARS);
}

function buildObservations({ rows, total, metrics, sectors, pePair }) {
    const out = [];
    const weightOf = (list) => (total > 0 ? (sumBy(list, (r) => r.valueARS) / total) * 100 : 0);

    if (rows.length >= 4) {
        const top = [...rows].sort((a, b) => b.valueARS - a.valueARS).slice(0, 3);
        const share = weightOf(top);
        if (share >= 50) {
            out.push({
                id: 'top3',
                title: `${listText(top.map((r) => r.symbol))} son el ${fmt(share, 0)}\u00a0% de tus acciones`,
                text: 'Lo que pase con estas tres empresas explica la mayor parte de este análisis.',
            });
        }
    }

    if (sectors[0] && sectors.length > 1 && sectors[0].weight >= 40) {
        out.push({
            id: 'sector',
            title: `El ${fmt(sectors[0].weight, 0)}\u00a0% está en ${sectors[0].name}`,
            text: 'Un mismo hecho del sector (precios, regulaciones, tasas) puede mover a varias de tus empresas a la vez.',
        });
    }

    const losing = rows.filter((r) => finite(r.profitMargin) && r.profitMargin < 0);
    if (losing.length > 0) {
        const one = losing.length === 1;
        out.push({
            id: 'perdidas',
            title: `${listText(losing.map((r) => r.symbol))} ${one ? 'tuvo' : 'tuvieron'} pérdidas en el último año`,
            text: `Margen neto negativo en los últimos 12 meses informados${one ? ` (${fmt(losing[0].profitMargin)}\u00a0%)` : ''}.`,
        });
    }

    const negative = rows.filter((r) => r.consensus === 'negative');
    if (negative.length > 0) {
        out.push({
            id: 'pesimistas',
            title: `Los analistas son pesimistas con ${listText(negative.map((r) => r.symbol))}`,
            text: `Suma${negative.length === 1 ? '' : 'n'} el ${fmt(weightOf(negative), 0)}\u00a0% de tus acciones. Es la opinión promedio relevada por Yahoo Finance, no una recomendación.`,
        });
    }

    if (pePair) {
        const { pe, forwardPe } = pePair;
        if (forwardPe < pe * 0.9 || forwardPe > pe * 1.1) {
            const grow = forwardPe < pe;
            out.push({
                id: 'ganancias',
                title: grow ? 'Los analistas esperan más ganancias' : 'Los analistas esperan menos ganancias',
                text: `Con el precio de hoy, el P/E pasa de ${fmt(pe)}x (últimos 12 meses) a ${fmt(forwardPe)}x (próximos 12 meses) en las empresas con ambos datos.`,
            });
        }
    }

    const beta = metrics.beta.value;
    if (beta !== null) {
        const title = beta > 1.1
            ? 'Tus acciones en dólares se mueven más que el mercado'
            : beta < 0.9
                ? 'Tus acciones en dólares se mueven menos que el mercado'
                : 'Tus acciones en dólares se mueven parecido al mercado';
        const text = beta > 0.1
            ? `Beta ${fmt(beta, 2)}: cuando el S&P 500 se movió 10\u00a0%, estas acciones tendieron a moverse cerca de ${fmt(beta * 10)}\u00a0% en el mismo sentido.`
            : `Beta ${fmt(beta, 2)}: en conjunto casi no acompañaron los movimientos del S&P 500.`;
        out.push({ id: 'beta', title, text });
    }

    return out.slice(0, 5);
}

/**
 * @param holdings     tenencias de acciones y CEDEARs del catálogo: { symbol, catalogSymbol, valueARS, weight, pct }
 * @param fundamentals datos de /api/portfolio-fundamentals por símbolo de Yahoo
 * @param mep          dólar MEP (para pasar dividendos a dólares); null si no hay
 */
export function analyzeCompanies(holdings, fundamentals = {}, { mep = null, now = Date.now() } = {}) {
    const today = startOfDay(now);
    const rows = holdings.filter((h) => h.valueARS > 0).map((h) => buildRow(h, fundamentals, today));
    const total = sumBy(rows, (r) => r.valueARS);
    for (const r of rows) r.weight = total > 0 ? (r.valueARS / total) * 100 : 0;

    const usdRows = rows.filter((r) => r.usdListed);
    const metrics = {
        pe: weighted(rows, (r) => r.pe, { accept: positiveMultiple(250), harmonic: true }),
        forwardPe: weighted(rows, (r) => r.forwardPe, { accept: coherentForwardPe, harmonic: true }),
        pb: weighted(rows, (r) => r.pb, { accept: positiveMultiple(100), harmonic: true }),
        roe: weighted(rows, (r) => r.roe, { accept: withinRatioLimit }),
        operatingMargin: weighted(rows, (r) => r.operatingMargin, { accept: withinRatioLimit }),
        profitMargin: weighted(rows, (r) => r.profitMargin, { accept: withinRatioLimit }),
        dividendYield: weighted(rows, (r) => r.dividendYield),
        beta: weighted(usdRows, (r) => r.beta),
        upside: weighted(usdRows, (r) => r.upside, { accept: (v, r) => r.analysts >= MIN_ANALYSTS }),
    };

    // Comparar P/E actual y futuro sobre las mismas empresas (si no, cada promedio tiene otra base).
    const both = rows.filter((r) => finite(r.pe) && r.pe > 0 && r.pe < 250 && finite(r.forwardPe) && coherentForwardPe(r.forwardPe, r));
    const pePair = both.length > 0 && sumBy(both, (r) => r.valueARS) / total * 100 >= MIN_COVERAGE
        ? {
            pe: weighted(both, (r) => r.pe, { harmonic: true }).value,
            forwardPe: weighted(both, (r) => r.forwardPe, { harmonic: true }).value,
        }
        : null;

    const sectors = shares(rows, (r) => r.sector, total);
    const regions = shares(rows, (r) => (r.local ? 'Argentina' : 'Exterior'), total);

    const consensus = { positive: 0, neutral: 0, negative: 0, none: 0 };
    for (const r of rows) consensus[r.consensus ?? 'none'] += r.weight;

    const toUSD = (v) => (finite(mep) && mep > 0 ? v / mep : null);
    const payers = rows
        .filter((r) => r.dividendYield > 0)
        .map((r) => {
            const yearly = (r.valueARS * r.dividendYield) / 100;
            return { symbol: r.symbol, name: r.name, yield: r.dividendYield, yearlyARS: yearly, yearlyUSD: toUSD(yearly) };
        })
        .sort((a, b) => b.yearlyARS - a.yearlyARS);
    const yearlyARS = sumBy(payers, (p) => p.yearlyARS);
    const dividends = {
        yearlyARS,
        yearlyUSD: toUSD(yearlyARS),
        payers,
        reported: rows.filter((r) => r.dividendYield !== null).length,
    };

    const horizon = today + EVENTS_DAYS * DAY;
    const events = [];
    for (const r of rows) {
        if (r.nextEarnings && r.nextEarnings <= horizon) events.push({ date: r.nextEarnings, symbol: r.symbol, type: 'earnings' });
        if (r.exDividend && r.exDividend <= horizon) events.push({ date: r.exDividend, symbol: r.symbol, type: 'exDividend' });
        if (r.dividendDate && r.dividendDate <= horizon) events.push({ date: r.dividendDate, symbol: r.symbol, type: 'dividend' });
    }
    events.sort((a, b) => a.date - b.date);

    return {
        rows,
        totalARS: total,
        withoutData: rows.filter((r) => !r.hasData).map((r) => r.symbol),
        metrics,
        pePair,
        sectors,
        regions,
        consensus,
        dividends,
        events,
        observations: buildObservations({ rows, total, metrics, sectors, pePair }),
    };
}
