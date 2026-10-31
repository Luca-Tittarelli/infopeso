import { GUIAS } from '@/utils/guiasData';
import Link from 'next/link';
import { jsonLd } from '@/utils/site';

export const metadata = {
    title: 'Guías Educativas de Finanzas e Inversiones',
    description: 'Material educativo y conceptual sobre finanzas en Argentina: estructura de carteras, CEDEARs, bonos soberanos (AL30, GD30), Dólar MEP, CCL y análisis fundamental.',
    openGraph: {
        title: 'Guías Educativas de Finanzas e Inversiones',
        description: 'Material educativo y conceptual sobre finanzas en Argentina: estructura de carteras, CEDEARs, bonos soberanos (AL30, GD30), Dólar MEP, CCL y análisis fundamental.',
        url: 'https://www.infopeso.com.ar/guias',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/guias',
    }
};

export default function GuiasHubPage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Guías Educativas", "item": "https://www.infopeso.com.ar/guias" }
        ]
    };

    const categories = Array.from(new Set(GUIAS.map(g => g.category)));

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
            />

            {/* Header section */}
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container">
                    <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                        EDUCACIÓN Y ANÁLISIS FINANCIERO
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Guías educativas de finanzas e inversiones
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-2)', marginBottom: 0, maxWidth: '64ch' }}>
                        Conceptos claros, fórmulas de valuación y marcos analíticos para entender el mercado de capitales argentino y la macroeconomía.
                    </p>
                </div>
            </header>

            <div className="pulso-container" style={{ paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
                {/* Aviso informativo */}
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
                    Información con fines informativos. No es una recomendación de inversión. El contenido de todas las guías de Infopeso tiene un propósito estrictamente educativo y no constituye asesoramiento financiero ni invitación a comprar o vender valores negociables.
                </div>

                {/* Simulador de Cartera Destacado */}
                <div className="pulso-card flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div style={{ maxWidth: '60ch' }}>
                        <span className="label" style={{ color: 'var(--signal-text)', display: 'block', marginBottom: 'var(--space-1)' }}>
                            SIMULADOR EDUCATIVO GRATUITO
                        </span>
                        <h2 className="h2" style={{ color: 'var(--ink)', margin: '0 0 var(--space-2) 0' }}>
                            Simulador y seguimiento de cartera con múltiplos ponderados
                        </h2>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Probá distintas combinaciones de acciones argentinas y CEDEARs para analizar sus múltiplos consolidados (P/E, ROE, dividendos) en un solo tablero.
                        </p>
                    </div>
                    <Link href="/Cartera" className="pulso-btn pulso-btn--primary shrink-0">
                        Abrir simulador de cartera
                    </Link>
                </div>

                {/* Artículos agrupados por categoría */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                    {categories.map((cat) => {
                        const guiasInCategory = GUIAS.filter(g => g.category === cat);
                        return (
                            <section key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div className="flex items-center gap-3">
                                    <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                                        {cat}
                                    </h2>
                                    <div className="flex-1" style={{ height: '1px', background: 'var(--line)' }} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
                                    {guiasInCategory.map((guia) => (
                                        <Link
                                            key={guia.slug}
                                            href={`/guias/${guia.slug}`}
                                            className="pulso-card pulso-card--interactive flex flex-col justify-between"
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                                <div className="flex items-center justify-between">
                                                    <span className="label" style={{ color: 'var(--signal-text)' }}>
                                                        {guia.category}
                                                    </span>
                                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)' }}>
                                                        {guia.readTime}
                                                    </span>
                                                </div>
                                                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', margin: 0, lineHeight: 1.3 }}>
                                                    {guia.title}
                                                </h3>
                                                <p className="body-sm line-clamp-3" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                                    {guia.description}
                                                </p>
                                            </div>
                                            <div
                                                className="flex items-center justify-between"
                                                style={{
                                                    paddingTop: 'var(--space-3)',
                                                    marginTop: 'var(--space-4)',
                                                    borderTop: '1px solid var(--line)',
                                                    color: 'var(--signal-text)',
                                                    fontSize: 'var(--text-caption)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                <span>Leer guía completa</span>
                                                <span aria-hidden="true">→</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
