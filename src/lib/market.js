// Precios de bonos y CEDEARs en BYMA vía data912.com (proyecto abierto, sin garantías de disponibilidad).
// Todas las funciones devuelven null si la fuente falla para que las páginas se muestren sin precio.
const DATA912 = 'https://data912.com/live';

async function getList(path, revalidate = 300) {
    try {
        const res = await fetch(`${DATA912}/${path}`, { next: { revalidate } });
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? data : null;
    } catch {
        return null;
    }
}

export const getBymaBonds = () => getList('arg_bonds');
export const getCedears = () => getList('arg_cedears');

const bySymbol = (list, symbol) => list?.find((x) => x.symbol === symbol) || null;
const price = (row) => (row && typeof row.c === 'number' && row.c > 0 ? row.c : null);

// Bono: precio en pesos (AL30), en dólares MEP (AL30D) y en dólares CCL (AL30C)
export async function getBondPricing(id) {
    const list = await getBymaBonds();
    if (!list) return null;
    const ars = bySymbol(list, id);
    const pricing = {
        ars: price(ars),
        arsChangePct: ars?.pct_change ?? null,
        usdMep: price(bySymbol(list, `${id}D`)),
        usdCcl: price(bySymbol(list, `${id}C`)),
    };
    return pricing.ars || pricing.usdMep || pricing.usdCcl ? pricing : null;
}

// CEDEAR: precio en pesos y CCL implícito = precio en pesos / precio de la especie C (dólar cable)
export async function getCedearPricing(ticker) {
    const list = await getCedears();
    if (!list) return null;
    const ars = price(bySymbol(list, ticker));
    const usdCcl = price(bySymbol(list, `${ticker}C`));
    if (!ars) return null;
    return {
        ars,
        changePct: bySymbol(list, ticker)?.pct_change ?? null,
        usdCcl,
        impliedCcl: usdCcl ? ars / usdCcl : null,
    };
}

// ─── Índice de cotizaciones para la cartera real ──────────────────────────────
// Prioridad cuando un ticker aparece en más de una lista: acciones, CEDEARs, bonos, letras y ON.
const BYMA_LISTS = [
    ['stock', 'arg_stocks'],
    ['cedear', 'arg_cedears'],
    ['bond', 'arg_bonds'],
    ['note', 'arg_notes'],
    ['corp', 'arg_corp'],
];

const lastPrice = (row) => {
    if (typeof row?.c === 'number' && row.c > 0) return row.c;
    if (typeof row?.px_bid === 'number' && row.px_bid > 0) return row.px_bid;
    return null;
};

// Devuelve { SYMBOL: { kind, price, pct, currency } } para los tickers pedidos que cotizan en BYMA.
// currency: "ARS", o "USD" para las especies en dólares (AL30D = MEP, AL30C = cable) cuya especie base existe en la misma lista.
export async function getBymaQuotes(symbols) {
    const lists = await Promise.all(BYMA_LISTS.map(([, path]) => getList(path, 60)));
    if (lists.every((l) => l === null)) return null;

    const quotes = {};
    for (const symbol of symbols) {
        for (let i = 0; i < BYMA_LISTS.length; i++) {
            const list = lists[i];
            const row = list?.find((x) => x.symbol === symbol);
            const price = lastPrice(row);
            if (!row || price === null) continue;
            const base = symbol.slice(0, -1);
            // Obligaciones negociables: por convención terminan en D (dólar MEP) o C (cable) aunque no exista la especie en pesos.
            const isUsdVariant = /[DC]$/.test(symbol) && (BYMA_LISTS[i][0] === 'corp' || list.some((x) => x.symbol === base));
            quotes[symbol] = {
                kind: BYMA_LISTS[i][0],
                price,
                pct: typeof row.pct_change === 'number' ? row.pct_change : null,
                currency: isUsdVariant ? 'USD' : 'ARS',
            };
            break;
        }
    }
    return quotes;
}
