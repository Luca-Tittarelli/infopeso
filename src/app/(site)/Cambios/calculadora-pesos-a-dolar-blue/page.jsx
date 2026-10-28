import CalculadoraBlueClient from './CalculadoraBlueClient';
import Link from 'next/link';
import { jsonLd } from '@/utils/site';
import RelatedLinks from '@/components/RelatedLinks';
import { getDolares, getHistory, valueMonthsAgo, fmtARS } from '@/lib/fx';
import AdSlot from '@/components/ads/AdSlot';

export const metadata = {
    title: 'Calculadora de Pesos a Dólar Blue Hoy en Argentina (Conversor Online)',
    description: 'Calcula al instante el equivalente de tus pesos argentinos a dólar blue (o dólares a pesos). Tabla de conversiones frecuentes ($100, $500, $1000 USD) al tipo de cambio paralelo de hoy.',
    openGraph: {
        title: 'Calculadora de Pesos a Dólar Blue Hoy en Argentina (Conversor Online)',
        description: 'Calcula al instante el equivalente de tus pesos argentinos a dólar blue (o dólares a pesos). Tabla de conversiones frecuentes ($100, $500, $1000 USD) al tipo de cambio paralelo de hoy.',
        url: 'https://www.infopeso.com.ar/Cambios/calculadora-pesos-a-dolar-blue',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/Cambios/calculadora-pesos-a-dolar-blue',
    }
};

export default async function Page() {
    const [dolares, blueHistory] = await Promise.all([getDolares(), getHistory({ casa: 'blue' })]);
    const dolarBlueData = dolares?.find((d) => d.casa === 'blue') || null;
    const byCasa = (casa) => dolares?.find((d) => d.casa === casa);
    const sameAmount = [
        { name: 'Dólar blue', q: byCasa('blue') },
        { name: 'Dólar oficial', q: byCasa('oficial') },
        { name: 'Dólar MEP', q: byCasa('bolsa') },
        { name: 'Dólar tarjeta', q: byCasa('tarjeta') },
    ].filter((r) => r.q?.venta);
    const ago = [1, 6, 12].map((m) => ({ months: m, row: valueMonthsAgo(blueHistory, m) })).filter((r) => r.row?.venta);
    const blueVenta = dolarBlueData?.venta;

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Calculadora de Pesos a Dólar Blue",
        "url": "https://www.infopeso.com.ar/Cambios/calculadora-pesos-a-dolar-blue",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "description": "Calculadora conversora online en tiempo real de pesos argentinos a dólar blue."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "¿Cómo funciona la calculadora de pesos a dólar blue?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "La calculadora utiliza el precio de venta actualizado del dólar blue para indicar cuántos pesos necesitas para adquirir determinado monto en dólares, y el precio de compra para calcular cuántos pesos recibes al vender dólares."
                }
            },
            {
                "@type": "Question",
                "name": "¿Cuántos pesos son 100 dólares blue hoy?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `El cálculo se realiza multiplicando 100 por el precio de venta del dólar blue del momento.${blueVenta ? ` Con el blue a $${fmtARS(blueVenta, 0)}, 100 dólares equivalen a $${fmtARS(blueVenta * 100, 0)}.` : ''} Consultá la tabla interactiva de la calculadora para ver el valor actualizado.`
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Divisas", "item": "https://www.infopeso.com.ar/Cambios" },
            { "@type": "ListItem", "position": 3, "name": "Calculadora Dólar Blue", "item": "https://www.infopeso.com.ar/Cambios/calculadora-pesos-a-dolar-blue" }
        ]
    };

    return (
        <main className="min-h-screen pt-14 pb-16 md:pb-12">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

            <section className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8">
                <nav className="flex items-center gap-2 mb-6">
                    <Link href="/Cambios" className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline" style={{ color: 'var(--text-secondary)' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Divisas
                    </Link>
                    <span style={{ color: 'var(--border-subtle)' }}>/</span>
                    <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        Calculadora Dólar Blue
                    </span>
                </nav>

                <CalculadoraBlueClient initialDolar={dolarBlueData} />

                <AdSlot slot="inContentA" />

                {sameAmount.length > 1 && (
                    <section className="mt-8 p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            100 dólares hoy: cuánto cuesta en cada cotización
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {sameAmount.map(({ name, q }) => (
                                        <tr key={name} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                            <td className="py-2">{name}</td>
                                            <td className="py-2 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>${fmtARS(q.venta * 100, 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {ago.length > 0 && blueVenta && (
                    <section className="mt-6 p-5 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            100 dólares blue: cuánto valían hace 1, 6 y 12 meses
                        </h2>
                        <table className="w-full text-sm">
                            <tbody>
                                {ago.map(({ months, row }) => (
                                    <tr key={months} style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                        <td className="py-2">Hace {months === 12 ? '1 año' : `${months} ${months === 1 ? 'mes' : 'meses'}`}</td>
                                        <td className="py-2 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>${fmtARS(row.venta * 100, 0)}</td>
                                    </tr>
                                ))}
                                <tr style={{ color: 'var(--text-secondary)' }}>
                                    <td className="py-2 font-bold">Hoy</td>
                                    <td className="py-2 text-right font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>${fmtARS(blueVenta * 100, 0)}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>Precio de venta del blue. Fuente: ArgentinaDatos y DolarAPI.</p>
                    </section>
                )}

                {/* Explicación SEO Contextual */}
                <article className="mt-12 pt-8 border-t border-[var(--border-subtle)] space-y-6">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        ¿Cómo calcular conversiones en el mercado informal?
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Para calcular exactamente cuántos pesos necesitás para comprar dólares en el mercado informal de Argentina, tenés que multiplicar la cantidad de dólares deseada por el precio de <strong>venta</strong> del Dólar Blue. Si tenés dólares billete y querés cambiarlos a pesos, debés multiplicar por la cotización de <strong>compra</strong>.
                    </p>
                </article>

                <AdSlot slot="multiplex" />

                <RelatedLinks
                    title="Otras cotizaciones y calculadoras"
                    links={[
                        { href: '/Cambios/dolar-blue', label: 'Dólar blue hoy', value: blueVenta ? `$${fmtARS(blueVenta, 0)}` : undefined },
                        { href: '/Cambios/dolar-oficial', label: 'Dólar oficial hoy' },
                        { href: '/Cambios/dolar-mep', label: 'Dólar MEP hoy' },
                        { href: '/Cambios/dolar-ccl', label: 'Dólar CCL hoy' },
                        { href: '/Cambios/calculadora-dolar-tarjeta', label: 'Calculadora de dólar tarjeta' },
                        { href: '/guias/dolar-mep-vs-ccl-vs-blue', label: 'Guía: MEP vs CCL vs blue' },
                    ]}
                />
            </section>
        </main>
    );
}
