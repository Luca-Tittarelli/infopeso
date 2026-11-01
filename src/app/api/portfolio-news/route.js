import { NextResponse } from 'next/server';
import { getCompanyBySymbol } from '@/utils/carteraData';
import { fetchCompanyNews } from '@/lib/companyNews';

// Noticias de las empresas de una cartera. Solo símbolos del catálogo (igual que /api/portfolio-fundamentals):
// el endpoint no sirve para buscar cualquier cosa en Google News.
const MAX_SYMBOLS = 8;

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const companies = [...new Set(
        (searchParams.get('symbols') || '')
            .split(',')
            .map((s) => s.trim().toUpperCase())
    )]
        .map(getCompanyBySymbol)
        .filter(Boolean)
        .slice(0, MAX_SYMBOLS);

    if (companies.length === 0) {
        return NextResponse.json({ error: 'Ninguno de los símbolos pertenece al catálogo de la Cartera' }, { status: 400 });
    }

    const results = await Promise.allSettled(companies.map(fetchCompanyNews));

    // Una misma nota puede aparecer en la búsqueda de dos empresas (por ejemplo, Mercado Libre y Nubank): se junta.
    // `rank` es su orden dentro de la empresa (0 = la más relevante); la pantalla lo usa para destacar una por empresa.
    const byKey = new Map();
    results.forEach((r, i) => {
        if (r.status !== 'fulfilled') return;
        r.value.forEach((item, rank) => {
            const key = item.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
            const prev = byKey.get(key);
            if (prev) {
                if (!prev.symbols.includes(companies[i].symbol)) prev.symbols.push(companies[i].symbol);
                prev.rank = Math.min(prev.rank, rank);
            } else {
                byKey.set(key, { ...item, rank, symbols: [companies[i].symbol] });
            }
        });
    });

    const items = [...byKey.values()].sort((a, b) => b.date.localeCompare(a.date));
    const failed = results.every((r) => r.status === 'rejected');

    return NextResponse.json(
        { items, failed },
        { headers: { 'Cache-Control': failed ? 'no-store' : 'public, s-maxage=900, stale-while-revalidate=1800' } }
    );
}
