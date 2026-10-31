import { CATEGORIES, getCompanyBySymbol } from '@/utils/carteraData';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/utils/site';
import RelatedLinks from '@/components/RelatedLinks';
import { getQuote } from '@/lib/yahoo';
import { getCedearPricing } from '@/lib/market';
import AdSlot from '@/components/ads/AdSlot';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber } from '@/utils/formatters';

const tickerOf = (c) => c.symbol.replace('.BA', '');
const isLocal = (c) => c.symbol.endsWith('.BA');
const money = (n, d = 2) => (typeof n === 'number' ? formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');

function resolveCompany(symbolParam) {
    if (!symbolParam) return null;
    const decoded = decodeURIComponent(symbolParam).toUpperCase();
    
    let company = getCompanyBySymbol(decoded);
    if (company) return company;

    for (const cat of CATEGORIES) {
        for (const c of cat.companies) {
            if (
                c.symbol.toUpperCase() === decoded ||
                c.name.toUpperCase() === decoded ||
                c.tvSymbol.toUpperCase().endsWith(`:${decoded}`) ||
                c.symbol.toUpperCase().replace('.BA', '') === decoded
            ) {
                return { ...c, category: cat.name };
            }
        }
    }
    return null;
}

export const dynamicParams = false;

export function generateStaticParams() {
    const symbols = [];
    for (const cat of CATEGORIES) {
        for (const c of cat.companies) {
            symbols.push({ symbol: encodeURIComponent(c.symbol) });
            if (c.symbol.includes('.BA')) {
                symbols.push({ symbol: c.symbol.replace('.BA', '').toLowerCase() });
            } else {
                symbols.push({ symbol: c.symbol.toLowerCase() });
            }
        }
    }
    return symbols;
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const company = resolveCompany(resolvedParams.symbol);
    if (!company) return {};

    const title = isLocal(company)
        ? `${company.name} (${tickerOf(company)}) hoy: cotización y precio de la acción`
        : `${company.name} (${tickerOf(company)}) hoy: cotización y CEDEAR en pesos`;
    const description = `Ficha informativa y análisis fundamental de ${company.name} (${company.symbol}). ${company.description} Plan de negocios y ratios clave con fines informativos.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://www.infopeso.com.ar/Empresas/${encodeURIComponent(company.symbol)}`,
            siteName: 'Infopeso',
            locale: 'es_AR',
            type: 'article',
            images: [{ url: company.logo || 'https://www.infopeso.com.ar/logo.png', width: 512, height: 512, alt: company.name }],
        },
        alternates: {
            canonical: `https://www.infopeso.com.ar/Empresas/${encodeURIComponent(company.symbol)}`,
        }
    };
}

export default async function EmpresaFichaPage({ params }) {
    const resolvedParams = await params;
    const company = resolveCompany(resolvedParams.symbol);

    if (!company) {
        notFound();
    }

    const [quote, cedear] = await Promise.all([
        getQuote(company.symbol),
        isLocal(company) ? null : getCedearPricing(tickerOf(company)),
    ]);
    const sectorPeers = CATEGORIES.flatMap((cat) => cat.companies)
        .filter((c) => c.sector === company.sector && c.symbol !== company.symbol)
        .slice(0, 6)
        .map((c) => ({ href: `/Empresas/${encodeURIComponent(c.symbol)}`, label: `${c.name} (${tickerOf(c)})` }));

    const financialProductSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": `Acciones de ${company.name} (${company.symbol})`,
        "description": company.description,
        "provider": {
            "@type": "Organization",
            "name": company.name,
            "url": `https://www.infopeso.com.ar/Empresas/${encodeURIComponent(company.symbol)}`
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Empresas", "item": "https://www.infopeso.com.ar/Empresas" },
            { "@type": "ListItem", "position": 3, "name": company.name, "item": `https://www.infopeso.com.ar/Empresas/${encodeURIComponent(company.symbol)}` }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `¿Cómo se negocian las acciones o CEDEARs de ${company.name} en Argentina?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Las acciones o CEDEARs de ${company.name} (${company.symbol}) se negocian a través de agentes bursátiles (ALyCs) autorizados por la Comisión Nacional de Valores (CNV) en Bolsas y Mercados Argentinos (BYMA), ya sea en pesos o en dólares.`
                }
            },
            {
                "@type": "Question",
                "name": `¿Cuál es el modelo de negocios de ${company.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": company.planDeNegocios
                }
            },
            {
                "@type": "Question",
                "name": `¿Cuáles son los fundamentos y ratios a monitorear en ${company.name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": company.fundamentosClave.join(' ')
                }
            }
        ]
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />

            <div className="pulso-container" style={{ paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 body-sm" style={{ color: 'var(--ink-subtle)' }} aria-label="Breadcrumb">
                    <Link href="/" className="hover:underline" style={{ color: 'var(--ink-muted)' }}>Inicio</Link>
                    <span>/</span>
                    <Link href="/Empresas" className="hover:underline" style={{ color: 'var(--ink-muted)' }}>Empresas</Link>
                    <span>/</span>
                    <span style={{ color: 'var(--ink)' }}>{company.name} ({company.symbol})</span>
                </nav>

                {/* Hero Header */}
                <header className="pulso-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '68ch' }}>
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className="label"
                                style={{
                                    padding: '2px var(--space-3)',
                                    borderRadius: 'var(--radius-pill)',
                                    background: 'var(--surface-200)',
                                    border: '1px solid var(--line)',
                                    color: 'var(--signal-text)',
                                }}
                            >
                                {company.sector}
                            </span>
                            <span className="source-badge">
                                Ticker: {company.symbol}
                            </span>
                            <span className="source-badge">
                                {company.tvSymbol}
                            </span>
                        </div>

                        <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                            {company.name}{' '}
                            <span className="data" style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-h2)', fontWeight: 500 }}>
                                ({company.symbol})
                            </span>
                        </h1>

                        <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            {company.description}
                        </p>
                    </div>

                    <Link href="/Cartera" className="pulso-btn pulso-btn--primary shrink-0">
                        Simular en mi cartera
                    </Link>
                </header>

                {/* Cotización */}
                {(quote?.price || cedear) && (
                    <section className="pulso-card grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--space-4)' }}>
                        {quote?.price && (
                            <div>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>
                                    Precio ({quote.currency === 'ARS' ? 'ARS' : 'US$'})
                                </p>
                                <p className="figure" style={{ fontSize: 'var(--text-h1)', color: 'var(--ink)', margin: 0 }}>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>
                                        {quote.currency === 'ARS' ? '$' : 'US$'}
                                    </span>
                                    {money(quote.price)}
                                </p>
                                {typeof quote.changePercent === 'number' && (
                                    <div style={{ marginTop: 'var(--space-2)' }}>
                                        <Delta value={quote.changePercent} pill={true} />
                                    </div>
                                )}
                            </div>
                        )}
                        {cedear && (
                            <div>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>CEDEAR en pesos</p>
                                <p className="figure" style={{ fontSize: 'var(--text-h1)', color: 'var(--ink)', margin: 0 }}>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {money(cedear.ars, 0)}
                                </p>
                            </div>
                        )}
                        {cedear?.impliedCcl && (
                            <div>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Dólar CCL implícito</p>
                                <p className="figure" style={{ fontSize: 'var(--text-h1)', color: 'var(--signal-text)', margin: 0 }}>
                                    <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginRight: '0.2em' }}>$</span>
                                    {money(cedear.impliedCcl, 0)}
                                </p>
                            </div>
                        )}
                        {quote?.fiftyTwoWeekLow && quote?.fiftyTwoWeekHigh && (
                            <div>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Rango 52 semanas</p>
                                <p className="data" style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
                                    {money(quote.fiftyTwoWeekLow)} – {money(quote.fiftyTwoWeekHigh)}
                                </p>
                            </div>
                        )}
                        {quote?.marketCap && (
                            <div>
                                <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Capitalización</p>
                                <p className="data" style={{ fontSize: 'var(--text-body)', fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
                                    US$ {formatNumber(quote.marketCap / 1e9, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil M
                                </p>
                            </div>
                        )}
                        {cedear && (
                            <p className="col-span-2 sm:col-span-4" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                                El CCL implícito es el precio del CEDEAR en pesos dividido por el de su especie en dólares cable (C). Es una estimación informativa.
                            </p>
                        )}
                    </section>
                )}

                <AdSlot slot="inContentA" />

                {/* Aviso legal requerido por manual */}
                <div
                    style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--surface-200)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink-muted)',
                        fontSize: 'var(--text-caption)',
                        lineHeight: 1.5,
                    }}
                >
                    <strong style={{ color: 'var(--signal-text)' }}>AVISO INFORMATIVO: </strong>
                    Información con fines informativos. No es una recomendación de inversión. Los datos sobre {company.name} ({company.symbol}) provienen de balances públicos y hechos relevantes de mercado y no constituyen asesoramiento financiero bajo la Ley N.º 26.831 de la CNV.
                </div>

                {/* Plan de Negocios */}
                <section className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        Plan de negocios y visión estratégica
                    </h2>
                    <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                        {company.planDeNegocios}
                    </p>
                </section>

                {/* Métricas y Fundamentales */}
                <section className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        Métricas y fundamentales a monitorear
                    </h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-3)', listStyle: 'none', padding: 0, margin: 0 }}>
                        {company.fundamentosClave.map((item, idx) => (
                            <li
                                key={idx}
                                className="body-sm flex items-start gap-2.5"
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--ground-000)',
                                    border: '1px solid var(--line)',
                                    color: 'var(--ink-muted)',
                                }}
                            >
                                <span style={{ color: 'var(--signal-text)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>—</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Análisis Sectorial Informativo */}
                <section className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <p className="label" style={{ color: 'var(--signal-text)', margin: 0 }}>
                        CONTEXTO SECTORIAL
                    </p>
                    <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        Análisis sectorial informativo
                    </h2>
                    <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                        {company.analisisProfesional}
                    </p>
                </section>

                <AdSlot slot="multiplex" />

                <RelatedLinks title={`Otras empresas de ${company.sector}`} links={sectorPeers} />

                {/* Call to action secundario */}
                <div className="pulso-card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <h3 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        ¿Querés evaluar {company.name} junto con tus otras posiciones?
                    </h3>
                    <p className="body-sm" style={{ color: 'var(--ink-muted)', maxWidth: '58ch', margin: 0 }}>
                        El simulador de cartera calcula el P/E ponderado, la distribución por sector y los múltiplos fundamentales en un panel consolidado.
                    </p>
                    <div style={{ paddingTop: 'var(--space-2)' }}>
                        <Link href="/Cartera" className="pulso-btn pulso-btn--secondary">
                            Abrir simulador de cartera
                        </Link>
                    </div>
                </div>

                {/* FAQs */}
                <section style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                        Preguntas frecuentes sobre {company.name}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {faqSchema.mainEntity.map((faq, idx) => (
                            <div key={idx} className="pulso-card">
                                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                    {faq.name}
                                </h3>
                                <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                    {faq.acceptedAnswer.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
