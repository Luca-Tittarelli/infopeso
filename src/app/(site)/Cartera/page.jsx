import CarteraApp from './CarteraApp';
import { CarteraHero, CarteraPresentacion } from './CarteraLanding';
import Link from 'next/link';
import { jsonLd } from '@/utils/site';

// Se muestran en la página y alimentan el schema FAQPage: siempre el mismo texto en los dos lugares.
const FAQ = [
    {
        q: '¿Qué brokers puedo usar?',
        a: 'Cocos Capital, IOL InvertirOnline, Balanz y Bull Market: subís el CSV de tu tenencia o pegás la tabla que ves en la web del broker. Con cualquier otro broker podés pegar la tabla o cargar cada activo a mano. Si usás varios, las cantidades se suman.',
    },
    {
        q: '¿Necesito crear una cuenta?',
        a: 'No. Sin cuenta, tu cartera se guarda en este navegador. Con una cuenta gratis se guarda en tu cuenta y la ves desde cualquier dispositivo. En ningún caso pedimos datos bancarios ni las claves de tu broker.',
    },
    {
        q: '¿De dónde salen los precios?',
        a: 'De las cotizaciones de BYMA, que pueden tener demora, y del dólar MEP para pasar el total a dólares. Lo que no cotiza en BYMA, como un fondo, se valúa con el monto de tu archivo o el que cargues.',
    },
    {
        q: '¿Para qué sirve Probar ideas?',
        a: 'Es un simulador: elegís acciones argentinas y CEDEARs, les asignás porcentajes y calcula los múltiplos ponderados (P/E, ROE, beta, dividendos) y la concentración de esa cartera hipotética. No modifica tu cartera real.',
    },
    {
        q: '¿Cómo se calculan los múltiplos ponderados?',
        a: 'Cada ratio se pondera según el peso de la empresa en la cartera. El P/E usa un promedio armónico, y los ROE, ROA o márgenes superiores al 100 % se excluyen porque distorsionan el promedio.',
    },
    {
        q: '¿Los avisos son recomendaciones de compra o venta?',
        a: 'No. Los avisos, diagnósticos y múltiplos son cálculos automáticos con fines informativos y educativos. No constituyen asesoramiento financiero ni recomendaciones de inversión en los términos de la Ley N° 26.831 de la CNV.',
    },
];

export const metadata = {
    title: 'Simulador y Tracker de Cartera de Inversiones — Acciones y CEDEARs',
    description: 'Herramienta gratuita de simulación y monitoreo de carteras personales con acciones argentinas y CEDEARs. Cálculo de múltiplos ponderados (P/E, ROE, Beta), diagnósticos automáticos y análisis fundamental. Fines estrictamente educativos e informativos.',
    keywords: [
        'simulador de cartera de inversiones',
        'tracker de acciones argentinas',
        'seguimiento de cedears',
        'portfolio de inversiones gratis',
        'diagnostico de cartera',
        'multiplos ponderados pe roe',
        'analisis fundamental cedears'
    ],
    openGraph: {
        title: 'Simulador y Tracker de Cartera de Inversiones',
        description: 'Monitoreo consolidado de fundamentals para carteras personales. Múltiplos ponderados (P/E, ROE, Margen, Beta, Dividend Yield), diagnósticos automatizados y consenso de mercado. Fines estrictamente educativos e informativos.',
        url: 'https://www.infopeso.com.ar/Cartera',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png', width: 512, height: 512, alt: 'Simulador de Cartera Infopeso' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/Cartera',
    }
};

export default function Page() {
    const softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Simulador de Cartera de Inversiones Infopeso",
        "url": "https://www.infopeso.com.ar/Cartera",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "description": "Herramienta gratuita de simulación y diagnóstico educativo de carteras de inversión con acciones argentinas y CEDEARs, múltiplos ponderados y métricas fundamentales."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(({ q, a }) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Simulador de Cartera", "item": "https://www.infopeso.com.ar/Cartera" }
        ]
    };

    return (
        <div className="min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
            />

            {/* Presentación renderizada en el servidor: tiene el único H1 de la página (indexable sin JavaScript).
                Para quien ya cargó su cartera se reduce al título y el tablero queda arriba. */}
            <CarteraHero />

            {/* Vistas interactivas: Mi cartera (real) y Probar ideas (simulador) */}
            <CarteraApp />

            <CarteraPresentacion />

            {/* Preguntas frecuentes y descargo renderizados en el servidor (las mismas preguntas que el schema FAQPage) */}
            <section
                className="pulso-container"
                style={{
                    marginTop: 'var(--space-16)',
                    paddingTop: 'var(--space-12)',
                    paddingBottom: 'var(--space-16)',
                    borderTop: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-6)',
                }}
            >
                <h2 className="h2" style={{ margin: 0 }}>
                    Preguntas frecuentes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                    {FAQ.map(({ q, a }) => (
                        <article key={q} className="pulso-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <h3 className="body" style={{ fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                                {q}
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                {a}
                            </p>
                        </article>
                    ))}
                </div>
                <div>
                    <Link href="/guias/armar-cartera-inversiones-argentina" className="pulso-btn pulso-btn-secondary pulso-btn-sm">
                        Guía para armar una cartera
                    </Link>
                </div>
                <p
                    role="note"
                    className="body-sm"
                    style={{
                        margin: 0,
                        padding: 'var(--space-3) var(--space-4)',
                        background: 'var(--surface-100)',
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--ink-muted)',
                    }}
                >
                    <strong style={{ color: 'var(--ink)' }}>Descargo de responsabilidad. </strong>
                    Esta herramienta tiene fines informativos y educativos. No brinda asesoramiento financiero, recomendaciones de compra o venta ni gestión de carteras reguladas por la Ley N° 26.831 de la CNV. Los avisos, los diagnósticos y los consensos son cálculos automáticos y no garantizan rentabilidad futura.
                </p>
            </section>
        </div>
    );
}
