import { BOND_DATA, calculateBondMetrics, getNextPayment } from '@/utils/bondCalculator';
import { getBondPricing } from '@/lib/market';
import RelatedLinks from '@/components/RelatedLinks';
import BonoDetalleClient from './BonoDetalleClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/utils/site';
import AdSlot from '@/components/ads/AdSlot';
import { formatNumber } from '@/utils/formatters';

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(BOND_DATA).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const bond = BOND_DATA[id];
    if (!bond) return {};

    const title = `${id} hoy: cotización, TIR y próximo pago`;
    const description = `Calculadora interactiva del Bono Soberano Argentino ${id} (${bond.name}). Consulta su TIR (XIRR), paridad, cronograma y flujo de fondos pendientes en dólares.`;
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://www.infopeso.com.ar/RentaFija/${id}`,
            siteName: "Infopeso",
            locale: "es_AR",
            type: "website",
            images: [{ url: "https://www.infopeso.com.ar/logo.png" }],
        },
        alternates: {
            canonical: `https://www.infopeso.com.ar/RentaFija/${id}`,
        }
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const bond = BOND_DATA[id];

    if (!bond) notFound();

    const pricing = await getBondPricing(id);
    const initialPrice = pricing?.usdMep || null;
    const metrics = initialPrice ? calculateBondMetrics(id, initialPrice) : null;
    const nextPayment = getNextPayment(id);
    const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    const related = [
        ...Object.keys(BOND_DATA).filter((k) => k !== id).map((k) => ({ href: `/RentaFija/${k}`, label: BOND_DATA[k].name })),
        { href: '/Cambios/dolar-mep', label: 'Dólar MEP hoy' },
        { href: '/Cambios/dolar-ccl', label: 'Dólar CCL hoy' },
        { href: '/Economia/riesgo-pais', label: 'Riesgo país Argentina' },
        { href: '/guias/bonos-argentinos-al30-vs-gd30', label: 'Guía: AL30 vs GD30' },
    ];

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Renta Fija", "item": "https://www.infopeso.com.ar/RentaFija" },
            { "@type": "ListItem", "position": 3, "name": bond.name, "item": `https://www.infopeso.com.ar/RentaFija/${id}` }
        ]
    };

    const financialProductSchema = {
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        "name": bond.name,
        "description": `Bono Soberano Argentino con ticker ${id} emitido en dólares estadounidenses.`,
        "provider": {
            "@type": "Organization",
            "name": "Infopeso"
        }
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(financialProductSchema) }} />

            <section className="pulso-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-6" aria-label="Breadcrumb">
                    <Link
                        href="/RentaFija"
                        className="flex items-center gap-1.5 body-sm hover:underline"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Renta fija
                    </Link>
                    <span style={{ color: 'var(--line)' }}>/</span>
                    <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>
                        Bono {id}
                    </span>
                </nav>

                {pricing && (
                    <section className="mb-8 pulso-card grid grid-cols-2 md:grid-cols-5" style={{ gap: 'var(--space-4)' }}>
                        <div>
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Precio en pesos</p>
                            <p className="data" style={{ fontSize: 'var(--text-h2)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                                {pricing.ars ? `$ ${formatNumber(pricing.ars, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Precio USD (MEP)</p>
                            <p className="data" style={{ fontSize: 'var(--text-h2)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                                {pricing.usdMep ? `US$ ${formatNumber(pricing.usdMep, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Precio USD (CCL)</p>
                            <p className="data" style={{ fontSize: 'var(--text-h2)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                                {pricing.usdCcl ? `US$ ${formatNumber(pricing.usdCcl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>TIR · Paridad</p>
                            <p className="data" style={{ fontSize: 'var(--text-h2)', fontWeight: 600, color: 'var(--signal-text)', margin: 0 }}>
                                {metrics ? `${formatNumber(metrics.tir, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} % · ${formatNumber(metrics.paridad, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-1)' }}>Próximo pago</p>
                            <p className="body-sm" style={{ fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                                {nextPayment ? `${fmtDate(nextPayment.date)} (US$ ${formatNumber(nextPayment.amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : '—'}
                            </p>
                        </div>
                        <p className="col-span-2 md:col-span-5" style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                            Precios por 100 VN con demora, fuente BYMA vía data912. TIR y paridad calculadas sobre el precio en dólares MEP y el cronograma de pagos pendientes. Información con fines informativos. No es una recomendación de inversión.
                        </p>
                    </section>
                )}

                <BonoDetalleClient ticker={id} bond={bond} initialPrice={initialPrice} />

                <AdSlot slot="inContentA" />

                <section style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--line)' }}>
                    <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                        Información financiera sobre el bono {id}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 mb-6" style={{ gap: 'var(--space-4)' }}>
                        <div className="pulso-card">
                            <h3 className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                                ¿Qué es el bono {id}?
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                El bono {bond.name} es un título público de deuda soberana emitido por la República Argentina en dólares estadounidenses. Forma parte del esquema de reestructuración de deuda y representa una promesa de pago con cronogramas preestablecidos de interés y amortizaciones parciales de capital.
                            </p>
                        </div>
                        <div className="pulso-card">
                            <h3 className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                                ¿Cómo funciona esta calculadora?
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                La calculadora computa la Tasa Interna de Retorno (TIR) usando la fórmula XIRR para flujos de fondos con intervalos irregulares, tomando el precio ingresado como flujo negativo inicial y los cupones futuros como flujos positivos. La paridad representa la relación porcentual entre el precio actual de mercado y el valor residual del bono.
                            </p>
                        </div>
                    </div>
                </section>

                <AdSlot slot="multiplex" />

                <RelatedLinks title="Otros bonos y datos relacionados" links={related} />
            </section>
        </main>
    );
}
