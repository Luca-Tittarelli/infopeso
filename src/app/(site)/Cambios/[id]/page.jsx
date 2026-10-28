import { getCambioMetadata, cambiosMetadata } from '@/utils/cambiosMetadata';
import CambiosDetalleClient from './CambiosDetalleClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RelatedLinks from '@/components/RelatedLinks';
import { getDolares, getCotizaciones, getHistory, pickQuote, valueMonthsAgo, fmtARS } from '@/lib/fx';
import { jsonLd } from '@/utils/site';
import AdSlot from '@/components/ads/AdSlot';

export const dynamicParams = false;

// Generate static params for SSG
export function generateStaticParams() {
    return Object.keys(cambiosMetadata).map((id) => ({ id }));
}

// Generate dynamic metadata
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const meta = getCambioMetadata(id);
    if (!meta) return {};

    const currencyData = await getCurrencyData(meta);
    const dynamicTitle = currencyData && currencyData.venta && currencyData.compra
        ? `${meta.name} Hoy: Venta $${currencyData.venta.toLocaleString('es-AR')} / Compra $${currencyData.compra.toLocaleString('es-AR')}`
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
    const symbol = meta.symbol || 'U$S';
    const venta = currencyData?.venta;
    const ago = [1, 6, 12].map((m) => ({ months: m, row: valueMonthsAgo(fullHistory, m) }));
    const amounts = meta.moneda ? [100, 500, 1000, 5000] : [10, 50, 100, 500, 1000];

    // Real/euro "blue" estimado: dólar blue x cotización cruzada oficial de la moneda
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
                return { href: `/Cambios/${k}`, label: m.name, value: q?.venta ? `$${fmtARS(q.venta, 1)}` : undefined };
            }),
        { href: '/Cambios/calculadora-pesos-a-dolar-blue', label: 'Calculadora de pesos a dólar blue' },
        { href: '/Cambios/calculadora-dolar-tarjeta', label: 'Calculadora de dólar tarjeta' },
    ];

    // Build structured data schemas
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
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://www.infopeso.com.ar"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Divisas",
                "item": "https://www.infopeso.com.ar/Cambios"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": meta.name,
                "item": `https://www.infopeso.com.ar/Cambios/${id}`
            }
        ]
    };

    return (
        <main className="min-h-screen pt-14 pb-16 md:pb-12">
            {/* Inject JSON-LD Schema on Server Side */}
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
                />
            )}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
            />

            <section className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8">
                {/* Breadcrumbs (Server-rendered) */}
                <nav className="flex items-center gap-2 mb-6">
                    <Link
                        href="/Cambios"
                        className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Divisas
                    </Link>
                    <span style={{ color: 'var(--border-subtle)' }}>/</span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        {meta.name}
                    </span>
                </nav>

                {/* Client calculator & chart component */}
                <CambiosDetalleClient
                    id={id}
                    meta={meta}
                    initialData={currencyData}
                    initialHistory={historyData}
                    symbol={symbol}
                />

                <AdSlot slot="inContentA" />

                {/* Tablas indexables con datos propios */}
                <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {symbol} a pesos según {meta.name}
                        </h2>
                        <table className="w-full text-sm">
                            <tbody>
                                {amounts.map((a) => (
                                    <tr key={a} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                        <td className="py-2 font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{symbol} {a.toLocaleString('es-AR')}</td>
                                        <td className="py-2 text-right" style={{ fontFamily: 'var(--font-mono)' }}>{venta ? `$${fmtARS(a * venta, 0)}` : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            ¿Cuánto valía hace 1, 6 y 12 meses?
                        </h2>
                        <table className="w-full text-sm">
                            <tbody>
                                {ago.map(({ months, row }) => (
                                    <tr key={months} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                        <td className="py-2">Hace {months === 12 ? '1 año' : `${months} ${months === 1 ? 'mes' : 'meses'}`}</td>
                                        <td className="py-2 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                                            {row?.venta ? `$${fmtARS(row.venta, 1)}` : '—'}
                                            {row?.venta && venta ? <span className="ml-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>{((venta / row.venta - 1) * 100).toLocaleString('es-AR', { maximumFractionDigits: 1, signDisplay: 'always' })}%</span> : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Precio de venta. Fuente: ArgentinaDatos.</p>
                    </div>
                </section>

                {blueEstimate && (
                    <section className="mt-6 p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {meta.moneda === 'BRL' ? 'Real blue' : 'Euro blue'} estimado: ${fmtARS(blueEstimate, 1)}
                        </h2>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            Es una estimación propia, no una cotización publicada: se calcula multiplicando el dólar blue (${fmtARS(blue.venta, 0)}) por la relación entre {meta.moneda === 'BRL' ? 'el real' : 'el euro'} oficial (${fmtARS(venta, 1)}) y el dólar oficial (${fmtARS(oficialUsd.venta, 0)}). Sirve de referencia para quien compra o vende {meta.moneda === 'BRL' ? 'reales' : 'euros'} en efectivo con dólares.
                        </p>
                    </section>
                )}

                {meta.moneda === 'BRL' && (
                    <section className="mt-6 p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            Viaje a Brasil: ¿cómo conviene pagar?
                        </h2>
                        <ul className="text-sm leading-relaxed list-disc pl-5 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
                            <li><strong>Tarjeta:</strong> se convierte al dólar tarjeta{tarjeta?.venta ? ` (hoy $${fmtARS(tarjeta.venta, 0)})` : ''}, que incluye la percepción impositiva; parte de ese recargo puede recuperarse en Ganancias o Bienes Personales.</li>
                            <li><strong>Efectivo en reales:</strong> comprarlos con dólares al precio estimado del real blue suele evitar el recargo, pero implica llevar efectivo.</li>
                            <li><strong>Pix y transferencias:</strong> algunas billeteras permiten pagar en reales con saldo en pesos; compará la cotización que aplican contra el real oficial de arriba.</li>
                        </ul>
                    </section>
                )}

                {/* Context section (Server-rendered, indexable!) */}
                <section className="mt-10 pt-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        Información y Contexto de Mercado
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                                ¿Qué es?
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {meta.definition}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)', fontFamily: 'var(--font-ui)' }}>
                                ¿Por qué es importante?
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {meta.importance}
                            </p>
                        </div>
                    </div>

                    {meta.faqs && meta.faqs.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold mb-4 mt-8" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                                Preguntas Frecuentes
                            </h2>
                            <div className="space-y-3">
                                {meta.faqs.map((faq, idx) => (
                                    <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                                        <h4 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                                            {faq.question}
                                        </h4>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
