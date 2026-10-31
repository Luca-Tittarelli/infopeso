import { getCambioMetadata, cambiosMetadata } from '@/utils/cambiosMetadata';
import CambiosDetalleClient from './CambiosDetalleClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RelatedLinks from '@/components/RelatedLinks';
import { getDolares, getCotizaciones, getHistory, pickQuote, valueMonthsAgo, fmtARS } from '@/lib/fx';
import { jsonLd } from '@/utils/site';
import AdSlot from '@/components/ads/AdSlot';
import { Delta } from '@/components/pulso/Delta';

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(cambiosMetadata).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const meta = getCambioMetadata(id);
    if (!meta) return {};

    const currencyData = await getCurrencyData(meta);
    const dynamicTitle = currencyData && currencyData.venta && currencyData.compra
        ? `${meta.name} Hoy: Venta $ ${currencyData.venta.toLocaleString('es-AR')} / Compra $ ${currencyData.compra.toLocaleString('es-AR')}`
        : meta.title;

    return {
        title: dynamicTitle,
        description: meta.description,
        openGraph: {
            title: dynamicTitle,
            description: meta.description,
            url: `https://www.infopeso.com.ar/Cambios/${id}`,
            siteName: "Infopeso",
            locale: "es_AR",
            type: "website",
            images: [{ url: "https://www.infopeso.com.ar/logo.png" }],
        },
        alternates: {
            canonical: `https://www.infopeso.com.ar/Cambios/${id}`,
        }
    };
}

async function getCurrencyData(meta) {
    const [dolares, cotizaciones] = await Promise.all([getDolares(), meta.moneda ? getCotizaciones() : null]);
    return pickQuote(meta, dolares, cotizaciones);
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const meta = getCambioMetadata(id);

    if (!meta) notFound();

    const [dolares, cotizaciones, fullHistory] = await Promise.all([
        getDolares(),
        meta.moneda ? getCotizaciones() : null,
        getHistory(meta),
    ]);
    const currencyData = pickQuote(meta, dolares, cotizaciones);
    const historyData = Array.isArray(fullHistory) ? fullHistory.slice(-45) : null;
    const rawSymbol = meta.symbol || 'US$';
    const symbol = rawSymbol === 'U$S' ? 'US$' : rawSymbol;
    const venta = currencyData?.venta;
    const ago = [1, 6, 12].map((m) => ({ months: m, row: valueMonthsAgo(fullHistory, m) }));
    const amounts = meta.moneda ? [100, 500, 1000, 5000] : [10, 50, 100, 500, 1000];

    const blue = dolares?.find((d) => d.casa === 'blue');
    const oficialUsd = dolares?.find((d) => d.casa === 'oficial');
    const tarjeta = dolares?.find((d) => d.casa === 'tarjeta');
    const blueEstimate = meta.moneda && venta && blue?.venta && oficialUsd?.venta
        ? (blue.venta * venta) / oficialUsd.venta
        : null;

    const related = [
        ...['dolar-blue', 'dolar-oficial', 'dolar-mep', 'dolar-ccl', 'dolar-tarjeta', 'dolar-cripto', 'euro', 'real']
            .filter((k) => k !== id)
            .slice(0, 5)
            .map((k) => {
                const m = cambiosMetadata[k];
                const q = pickQuote(m, dolares, cotizaciones);
                return { href: `/Cambios/${k}`, label: m.name, value: q?.venta ? `$ ${fmtARS(q.venta, 2)}` : undefined };
            }),
        { href: '/Cambios/calculadora-pesos-a-dolar-blue', label: 'Calculadora de pesos a dólar blue' },
        { href: '/Cambios/calculadora-dolar-tarjeta', label: 'Calculadora de dólar tarjeta' },
    ];

    const faqSchema = meta.faqs && meta.faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": meta.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    const financialProductSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": meta.name,
        "description": meta.description,
        "provider": {
            "@type": "Organization",
            "name": "Infopeso"
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Divisas", "item": "https://www.infopeso.com.ar/Cambios" },
            { "@type": "ListItem", "position": 3, "name": meta.name, "item": `https://www.infopeso.com.ar/Cambios/${id}` }
        ]
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            {faqSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
            )}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

            <section className="pulso-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-6" aria-label="Breadcrumb">
                    <Link
                        href="/Cambios"
                        className="flex items-center gap-1.5 body-sm hover:underline"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Divisas
                    </Link>
                    <span style={{ color: 'var(--line)' }}>/</span>
                    <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>
                        {meta.name}
                    </span>
                </nav>

                <CambiosDetalleClient
                    id={id}
                    meta={meta}
                    initialData={currencyData}
                    initialHistory={historyData}
                    symbol={symbol}
                />

                <AdSlot slot="inContentA" />

                {/* Tablas indexables con datos propios */}
                <section className="mt-10 grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                    <div className="pulso-card">
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                            {symbol} a pesos según {meta.name}
                        </h2>
                        <table className="w-full">
                            <tbody>
                                {amounts.map((a) => (
                                    <tr key={a} style={{ borderBottom: '1px solid var(--line)' }}>
                                        <td className="py-2.5 data" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                                            {symbol} {a.toLocaleString('es-AR')}
                                        </td>
                                        <td className="py-2.5 text-right data" style={{ color: 'var(--ink)' }}>
                                            {venta ? `$ ${fmtARS(a * venta, 0)}` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pulso-card">
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                            ¿Cuánto valía hace 1, 6 y 12 meses?
                        </h2>
                        <table className="w-full">
                            <tbody>
                                {ago.map(({ months, row }) => {
                                    const pct = row?.venta && venta ? ((venta / row.venta - 1) * 100) : null;
                                    return (
                                        <tr key={months} style={{ borderBottom: '1px solid var(--line)' }}>
                                            <td className="py-2.5 body-sm" style={{ color: 'var(--ink-muted)' }}>
                                                Hace {months === 12 ? '1 año' : `${months} ${months === 1 ? 'mes' : 'meses'}`}
                                            </td>
                                            <td className="py-2.5 text-right data" style={{ color: 'var(--ink)' }}>
                                                <span>{row?.venta ? `$ ${fmtARS(row.venta, 2)}` : '—'}</span>
                                                {pct !== null && (
                                                    <span className="ml-2">
                                                        <Delta value={pct} />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                            Precio de venta. Fuente: ArgentinaDatos.
                        </p>
                    </div>
                </section>

                {blueEstimate && (
                    <section className="mt-6 pulso-card">
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                            {meta.moneda === 'BRL' ? 'Real blue' : 'Euro blue'} estimado: $ {fmtARS(blueEstimate, 2)}
                        </h2>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Es una estimación propia, no una cotización publicada: se calcula multiplicando el dólar blue ($ {fmtARS(blue.venta, 0)}) por la relación entre {meta.moneda === 'BRL' ? 'el real' : 'el euro'} oficial ($ {fmtARS(venta, 2)}) y el dólar oficial ($ {fmtARS(oficialUsd.venta, 0)}). Sirve de referencia para quien compra o vende {meta.moneda === 'BRL' ? 'reales' : 'euros'} en efectivo con dólares.
                        </p>
                    </section>
                )}

                {meta.moneda === 'BRL' && (
                    <section className="mt-6 pulso-card">
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                            Viaje a Brasil: ¿cómo conviene pagar?
                        </h2>
                        <ul className="body-sm list-disc pl-5 space-y-1.5" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            <li><strong>Tarjeta:</strong> se convierte al dólar tarjeta{tarjeta?.venta ? ` (hoy $ ${fmtARS(tarjeta.venta, 0)})` : ''}, que incluye la percepción impositiva; parte de ese recargo puede recuperarse en Ganancias o Bienes Personales.</li>
                            <li><strong>Efectivo en reales:</strong> comprarlos con dólares al precio estimado del real blue suele evitar el recargo, pero implica llevar efectivo.</li>
                            <li><strong>Pix y transferencias:</strong> algunas billeteras permiten pagar en reales con saldo en pesos; compará la cotización que aplican contra el real oficial de arriba.</li>
                        </ul>
                    </section>
                )}

                {/* Context section */}
                <section style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--line)' }}>
                    <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                        Información y contexto de mercado
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 mb-6" style={{ gap: 'var(--space-4)' }}>
                        <div className="pulso-card">
                            <h3 className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                                ¿Qué es?
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                {meta.definition}
                            </p>
                        </div>
                        <div className="pulso-card">
                            <h3 className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                                ¿Por qué es importante?
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                {meta.importance}
                            </p>
                        </div>
                    </div>

                    {meta.faqs && meta.faqs.length > 0 && (
                        <>
                            <h2 className="h2" style={{ color: 'var(--ink)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                                Preguntas frecuentes
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {meta.faqs.map((faq, idx) => (
                                    <div key={idx} className="pulso-card">
                                        <h4 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                            {faq.question}
                                        </h4>
                                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <AdSlot slot="multiplex" />

                <RelatedLinks title="Otras cotizaciones y calculadoras" links={related} />
            </section>
        </main>
    );
}
