import { NextResponse } from 'next/server';
import { getFundamentals } from '@/lib/yahoo';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || '';

    if (!symbolsParam) {
        return NextResponse.json({ error: 'Parámetro "symbols" requerido (separados por coma)' }, { status: 400 });
    }

    const symbols = symbolsParam
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 30);

    try {
        const results = {};

        await Promise.allSettled(
            symbols.map(async (rawSymbol) => {
                results[rawSymbol] = await getFundamentals(rawSymbol);
            })
        );

        return NextResponse.json(
            { fundamentals: results },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (e) {
        console.error('Error en /api/portfolio-fundamentals:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
