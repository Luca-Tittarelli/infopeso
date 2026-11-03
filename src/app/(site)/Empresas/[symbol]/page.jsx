import { CATEGORIES, getCompanyBySymbol } from '@/utils/carteraData';
import { EXTENDED_COMPANIES } from '@/utils/carteraExtended';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/utils/site';
import RelatedLinks from '@/components/RelatedLinks';
import { getQuote, getFundamentals } from '@/lib/yahoo';
import { getCedearPricing } from '@/lib/market';
import AdSlot from '@/components/ads/AdSlot';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber } from '@/utils/formatters';

const tickerOf = (c) => c.ticker ?? c.symbol.replace('.BA', '');
const isLocal = (c) => c.symbol.endsWith('.BA');
const money = (n, d = 2) => (typeof n === 'number' ? formatNumber(n, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—');
const pct = (n) => (typeof n === 'number' ? `${formatNumber(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %` : null);
const ratio = (n) => (typeof n === 'number' ? `${formatNumber(n, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}x` : null);

// Cómo lo escribe Google Finance ("BCBA: TGSU2", "NASDAQ: TSLA"): mucha gente busca la acción con ese formato.
const exchangeLabel = (c) => {
    if (c.tvSymbol) return c.tvSymbol.replace(':', ': ');
    return isLocal(c) ? `BCBA: ${tickerOf(c)}` : tickerOf(c);
};

const ALL_COMPANIES = [...CATEGORIES.flatMap((cat) => cat.companies), ...EXTENDED_COMPANIES];

const RECOMMENDATION_ES = {
    strong_buy: 'compra fuerte',
    buy: 'compra',
    hold: 'mantener',
    underperform: 'bajo rendimiento',
    sell: 'venta',
};

// Un múltiplo negativo (empresa con pérdidas) no se lee como "barato": se trata como dato no disponible.
function positiveMultiples(f) {
    if (!f) return f;
    const clean = { ...f };
    for (const key of ['pe', 'forwardPe', 'priceToBook', 'evToEbitda']) {
        if (typeof clean[key] === 'number' && clean[key] <= 0) clean[key] = null;
    }
    return clean;
}

// Las empresas extendidas no tienen texto editorial: la ficha se arma con los fundamentales del día.
function extendedSummary(company, f) {
    const parts = [`${company.name} (${exchangeLabel(company)}) es una empresa del sector ${company.sector}${isLocal(company) ? ' que cotiza en BYMA' : ' que se opera en Argentina como CEDEAR'}.`];
    if (typeof f?.pe === 'number') parts.push(`Cotiza a un P/E de ${ratio(f.pe)} sobre las ganancias de los últimos doce meses${typeof f.forwardPe === 'number' ? ` y a ${ratio(f.forwardPe)} sobre las ganancias esperadas` : ''}.`);
    if (typeof f?.roe === 'number') parts.push(`Su rentabilidad sobre el patrimonio (ROE) es de ${pct(f.roe)}${typeof f.profitMargin === 'number' ? ` y su margen neto de ${pct(f.profitMargin)}` : ''}.`);
    if (typeof f?.dividendYield === 'number' && f.dividendYield > 0) parts.push(`El rendimiento por dividendo es de ${pct(f.dividendYield)}.`);
    if (typeof f?.targetMeanPrice === 'number' && f.numberOfAnalysts > 0) parts.push(`${f.numberOfAnalysts} analistas le asignan un precio objetivo promedio de ${money(f.targetMeanPrice)} ${f.currency || ''}${typeof f.upsidePotential === 'number' ? ` (${f.upsidePotential >= 0 ? '+' : ''}${pct(f.upsidePotential)} respecto del precio actual)` : ''}.`);
    return parts.join(' ');
}

function extendedFaq(company, f) {
    const faqs = [
        {
            q: `¿Cómo comprar acciones de ${company.name} desde Argentina?`,
            a: isLocal(company)
                ? `Las acciones de ${company.name} cotizan en BYMA con la especie ${tickerOf(company)}. Se compran en pesos o dólares a través de cualquier ALyC registrada en la CNV.`
                : `${company.name} se opera en Argentina mediante su CEDEAR (${tickerOf(company)}) en BYMA, en pesos o dólares, a través de cualquier ALyC registrada en la CNV. Cada CEDEAR representa una fracción de la acción original según su ratio de conversión.`,
        },
    ];
    if (typeof f?.pe === 'number') {
        faqs.push({
            q: `¿Cuál es el P/E de ${company.name}?`,
            a: `El P/E (precio sobre ganancias) de ${company.name} es de ${ratio(f.pe)}: el mercado paga ${formatNumber(f.pe, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} veces su ganancia anual por acción.${typeof f.forwardPe === 'number' ? ` Sobre las ganancias proyectadas, el P/E es de ${ratio(f.forwardPe)}.` : ''}`,
        });
    }
    if (typeof f?.dividendYield === 'number') {
        faqs.push({
            q: `¿${company.name} paga dividendos?`,
            a: f.dividendYield > 0
                ? `Sí. El rendimiento por dividendo de ${company.name} es de ${pct(f.dividendYield)} anual sobre el precio actual.`
                : `${company.name} no registra pago de dividendos en los últimos doce meses.`,
        });
    }
    if (typeof f?.targetMeanPrice === 'number' && f.numberOfAnalysts > 0) {
        faqs.push({
            q: `¿Cuál es el precio objetivo de ${company.name}?`,
            a: `El consenso de ${f.numberOfAnalysts} analistas ubica el precio objetivo promedio de ${company.name} en ${money(f.targetMeanPrice)} ${f.currency || ''}${typeof f.targetLowPrice === 'number' && typeof f.targetHighPrice === 'number' ? `, con un rango de ${money(f.targetLowPrice)} a ${money(f.targetHighPrice)}` : ''}.${f.recommendationKey && RECOMMENDATION_ES[f.recommendationKey] ? ` La recomendación promedio es "${RECOMMENDATION_ES[f.recommendationKey]}".` : ''} No es una recomendación de inversión.`,
        });
    }
    return faqs;
}

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

// Las fichas editoriales se generan en el build; las extendidas se renderizan en la primera visita y quedan cacheadas
// (así el build no hace ~370 consultas a Yahoo). Un símbolo que no está en el catálogo cae en notFound().
export const dynamicParams = true;

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
        ? `${company.name} (${exchangeLabel(company)}) hoy: cotización y precio de la acción`
        : `${company.name} (${exchangeLabel(company)}) hoy: acción y CEDEAR en pesos`;
    const description = company.extended
        ? `Cotización de ${company.name} (${exchangeLabel(company)}) hoy${isLocal(company) ? '' : ', precio del CEDEAR en pesos'}, P/E, ROE, dividendos y precio objetivo de analistas. Datos con fines informativos.`
        : `Ficha informativa y análisis fundamental de ${company.name} (${company.symbol}). ${company.description} Plan de negocios y ratios clave con fines informativos.`;

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

function ExtendedFundamentals({ company, f }) {
    if (!f || f.error) return null;
    const rows = [
        ['P/E (últimos 12 meses)', ratio(f.pe)],
        ['P/E proyectado', ratio(f.forwardPe)],
        ['Precio / valor libro', ratio(f.priceToBook)],
        ['EV / EBITDA', ratio(f.evToEbitda)],
        ['ROE', pct(f.roe)],
        ['Margen operativo', pct(f.operatingMargin)],
        ['Margen neto', pct(f.profitMargin)],
        ['Deuda / patrimonio', typeof f.debtToEquity === 'number' ? `${formatNumber(f.debtToEquity, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} %` : null],
        ['Rendimiento por dividendo', pct(f.dividendYield)],
        ['Beta', typeof f.beta === 'number' ? formatNumber(f.beta, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null],
        ['Precio objetivo promedio', typeof f.targetMeanPrice === 'number' && f.numberOfAnalysts > 0 ? `${money(f.targetMeanPrice)} ${f.currency || ''}` : null],
        ['Analistas que la cubren', f.numberOfAnalysts > 0 ? String(f.numberOfAnalysts) : null],
    ].filter(([, value]) => value);
    if (rows.length === 0) return null;

    return (
        <section className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                Fundamentales de {company.name} hoy
            </h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 'var(--space-3)', margin: 0 }}>
                {rows.map(([label, value]) => (
                    <div
                        key={label}
                        style={{
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--ground-000)',
                            border: '1px solid var(--line)',
                        }}
                    >
                        <dt className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>{label}</dt>
                        <dd className="data" style={{ color: 'var(--ink)', fontWeight: 500, margin: 0 }}>{value}</dd>
                    </div>
                ))}
            </dl>
            <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                ¿Qué significa cada ratio? Lo explicamos en la guía <Link href="/guias/que-es-el-pe-ratio-price-to-earnings" className="hover:underline" style={{ color: 'var(--signal-text)' }}>qué es el P/E ratio</Link>.
            </p>
        </section>
    );
}

export default async function EmpresaFichaPage({ params }) {
    const resolvedParams = await params;
    const company = resolveCompany(resolvedParams.symbol);

    if (!company) {
        notFound();
    }

    const [quote, cedear, rawFundamentals] = await Promise.all([
        getQuote(company.symbol),
        isLocal(company) ? null : getCedearPricing(tickerOf(company)),
        company.extended ? getFundamentals(company.symbol) : null,
    ]);
    const fundamentals = positiveMultiples(rawFundamentals);
    const summary = company.extended ? extendedSummary(company, fundamentals) : company.description;

    // Pares del mismo sector y mercado: primero las fichas editoriales, después las extendidas. Así cada ficha
    // extendida recibe enlaces internos y no queda huérfana.
    const sectorPeers = ALL_COMPANIES
        .filter((c) => c.sector === company.sector && c.symbol !== company.symbol && isLocal(c) === isLocal(company))
        .slice(0, 9)
        .map((c) => ({ href: `/Empresas/${encodeURIComponent(c.symbol)}`, label: `${c.name} (${tickerOf(c)})` }));

    const financialProductSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": `Acciones de ${company.name} (${company.symbol})`,
        "description": summary,
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

    const faqSchema = company.extended ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": extendedFaq(company, fundamentals).map(({ q, a }) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
        }))
    } : {
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
                            {!isLocal(company) && (
                                <span className="source-badge">
                                    CEDEAR
                                </span>
                            )}
                        </div>

                        <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                            Acciones de {company.name}{' '}
                            <span className="data" style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-h2)', fontWeight: 500 }}>
                                ({exchangeLabel(company)})
                            </span>
                        </h1>

                        <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            {summary}
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
                                    {quote.currency === 'ARS' ? '$' : 'US$'} {formatNumber(quote.marketCap / 1e9, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mil M
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
                    Información con fines informativos. No es una recomendación de inversión. Los datos sobre {company.name} ({company.symbol}) provienen de {company.extended ? 'proveedores de datos de mercado (Yahoo Finance) y pueden demorarse' : 'balances públicos y hechos relevantes de mercado'} y no constituyen asesoramiento financiero bajo la Ley N.º 26.831 de la CNV.
                </div>

                {company.extended && <ExtendedFundamentals company={company} f={fundamentals} />}

                {!company.extended && (<>
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
                </>)}

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
