import EmpresasClient from './EmpresasClient';
import Link from 'next/link';
import { CATEGORIES } from '@/utils/carteraData';
import { getQuote } from '@/lib/yahoo';

export const metadata = {
    title: 'Terminal de Empresas y Fundamentales de Acciones',
    description: 'Análisis fundamental y sentimiento técnico de acciones argentinas (Galicia, YPF, Pampa) e internacionales (Apple, Microsoft, Tesla). balances, ratios y noticias.',
    openGraph: {
        title: 'Terminal de Empresas y Fundamentales de Acciones',
        description: 'Análisis fundamental y sentimiento técnico de acciones argentinas (Galicia, YPF, Pampa) e internacionales (Apple, Microsoft, Tesla). balances, ratios y noticias.',
        url: 'https://www.infopeso.com.ar/Empresas',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/Empresas',
    }
};

export default async function Page() {
    const companies = CATEGORIES.flatMap((cat) => cat.companies);
    const quotes = await Promise.all(companies.map((c) => getQuote(c.symbol)));

    return (
        <>
            <EmpresasClient />
            <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-12">
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    Fichas por empresa
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {companies.map((c, i) => {
                        const q = quotes[i];
                        return (
                            <li key={c.symbol}>
                                <Link href={`/Empresas/${encodeURIComponent(c.symbol)}`}
                                      className="flex items-center justify-between gap-3 p-3 rounded-xl text-sm hover:underline"
                                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                    <span>{c.name} <span style={{ color: 'var(--text-tertiary)' }}>({c.symbol.replace('.BA', '')})</span></span>
                                    {q?.price && (
                                        <span className="text-xs" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                                            {q.price.toLocaleString('es-AR', { maximumFractionDigits: 2 })} {q.currency}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </>
    );
}
