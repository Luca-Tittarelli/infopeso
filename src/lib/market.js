// Precios de bonos y CEDEARs en BYMA vía data912.com (proyecto abierto, sin garantías de disponibilidad).
// Todas las funciones devuelven null si la fuente falla para que las páginas se muestren sin precio.
const DATA912 = 'https://data912.com/live';

async function getList(path) {
    try {
        const res = await fetch(`${DATA912}/${path}`, { next: { revalidate: 300 } });
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
