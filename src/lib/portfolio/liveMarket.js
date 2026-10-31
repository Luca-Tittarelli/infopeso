import { getBymaQuotes } from '@/lib/market';
import { getDolares } from '@/lib/fx';

// Cotizaciones de BYMA para los tickers pedidos y dólar MEP, listos para valuar con summarize().
// quotes es null si BYMA no respondió; mep es null si no hay dólar MEP. Sin cualquiera de los dos conviene no armar fotos ni mails.
export async function getQuotesAndMep(symbols) {
    const [quotes, dolares] = await Promise.all([symbols.length ? getBymaQuotes(symbols) : Promise.resolve({}), getDolares()]);
    const mep = dolares?.find((d) => d.casa === 'bolsa')?.venta;
    return { quotes, mep: typeof mep === 'number' && mep > 0 ? mep : null };
}
