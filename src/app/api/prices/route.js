import { NextResponse } from 'next/server';
import { getBymaQuotes } from '@/lib/market';
import { getDolares } from '@/lib/fx';

const MAX_SYMBOLS = 400;
const SYMBOL_RE = /^[A-Z0-9]{1,12}$/;

// Cotizaciones de BYMA para los tickers pedidos y el dólar MEP/CCL, para valuar la cartera.
// Los tickers que no cotizan en BYMA (FCI, activos del exterior) simplemente no vuelven en `quotes`.
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbols = [...new Set(
        (searchParams.get('symbols') || '')
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter((s) => SYMBOL_RE.test(s))
    )].slice(0, MAX_SYMBOLS);

    const [quotes, dolares] = await Promise.all([
        symbols.length ? getBymaQuotes(symbols) : Promise.resolve({}),
        getDolares(),
    ]);

    const rate = (casa) => {
        const v = dolares?.find((d) => d.casa === casa)?.venta;
        return typeof v === 'number' && v > 0 ? v : null;
    };

    return NextResponse.json(
        {
            quotes: quotes ?? {},
            sourceOk: quotes !== null,
            mep: rate('bolsa'),
            ccl: rate('contadoconliqui'),
            updatedAt: new Date().toISOString(),
        },
        { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    );
}
