import { NextResponse } from 'next/server';
import { getFundamentals } from '@/lib/yahoo';
import { ANALYZED_SYMBOLS } from '@/utils/carteraData';

// Solo se consultan empresas del catálogo de la Cartera (editorial y extendido): evita que el endpoint se use como
// proxy gratuito de Yahoo Finance con símbolos arbitrarios.
const ALLOWED_SYMBOLS = new Set([...ANALYZED_SYMBOLS].map((s) => s.toUpperCase()));
const MAX_SYMBOLS = 30;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || '';

    if (!symbolsParam) {
        return NextResponse.json({ error: 'Parámetro "symbols" requerido (separados por coma)' }, { status: 400 });
    }

    const symbols = [...new Set(
        symbolsParam
            .split(',')
            .map(s => s.trim().toUpperCase())
            .filter(s => ALLOWED_SYMBOLS.has(s))
    )].slice(0, MAX_SYMBOLS);

    if (symbols.length === 0) {
        return NextResponse.json({ error: 'Ninguno de los símbolos pertenece al catálogo de la Cartera' }, { status: 400 });
    }

    try {
        const results = {};

        await Promise.allSettled(
            symbols.map(async (rawSymbol) => {
                results[rawSymbol] = await getFundamentals(rawSymbol);
            })
        );

        // Mismo plazo que la caché de getFundamentals (15 min): la CDN absorbe los pedidos repetidos.
        return NextResponse.json(
            { fundamentals: results },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
                },
            }
        );
    } catch (e) {
        console.error('Error en /api/portfolio-fundamentals:', e);
        return NextResponse.json({ error: 'No se pudieron obtener los datos' }, { status: 500 });
    }
}
