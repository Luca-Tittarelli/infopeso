import WidgetsGeneratorClient from './WidgetsGeneratorClient';
import { jsonLd } from '@/utils/site';

export const metadata = {
    title: 'Widgets Financieros Gratis para tu Web — Cotizaciones en Tiempo Real',
    description: 'Embebé widgets interactivos gratuitos de cotizaciones del Dólar Blue, MEP, Oficial y Mercados en tu sitio web, blog o portal de noticias. Código iframe listo para copiar y pegar.',
    openGraph: {
        title: 'Widgets Financieros Gratis para tu Web',
        description: 'Embebé widgets interactivos gratuitos de cotizaciones del Dólar Blue, MEP, Oficial y Mercados en tu sitio web, blog o portal de noticias. Código iframe listo para copiar y pegar.',
        url: 'https://www.infopeso.com.ar/widgets',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/widgets',
    }
};

export default function WidgetsPage() {
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Widgets Financieros", "item": "https://www.infopeso.com.ar/widgets" }
        ]
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
            />

            {/* Header Section */}
            <header
                style={{
                    borderBottom: '1px solid var(--line)',
                    padding: 'var(--space-8) 0',
                }}
            >
                <div className="pulso-container">
                    <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                        HERRAMIENTAS PARA MEDIOS Y DESARROLLADORES
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        Widgets de cotizaciones financieras para tu web
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-2)', marginBottom: 0, maxWidth: '64ch' }}>
                        Embebé cotizaciones del dólar blue, MEP, oficial y acciones en tu sitio o portal en menos de un minuto. Livianos, responsivos y con actualización automática.
                    </p>
                </div>
            </header>

            <div className="pulso-container" style={{ paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
                {/* Interactive Widget Configurator */}
                <WidgetsGeneratorClient />

                {/* Features & Integration Guide */}
                <section
                    className="grid grid-cols-1 md:grid-cols-3"
                    style={{
                        paddingTop: 'var(--space-8)',
                        borderTop: '1px solid var(--line)',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div className="pulso-card">
                        <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                            01 · RENDIMIENTO
                        </p>
                        <h3 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                            Ultra livianos
                        </h3>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Cargan en milisegundos sin afectar el rendimiento ni los indicadores Core Web Vitals de tu sitio.
                        </p>
                    </div>
                    <div className="pulso-card">
                        <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                            02 · TIEMPO REAL
                        </p>
                        <h3 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                            Actualización automática
                        </h3>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Los datos se actualizan de forma continua desde las APIs de Infopeso sin recargar tu servidor.
                        </p>
                    </div>
                    <div className="pulso-card">
                        <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                            03 · IDENTIDAD PULSO
                        </p>
                        <h3 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                            Modo oscuro y claro
                        </h3>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Elegí entre el tema pizarra cálida o papel diario para integrarlo con el diseño de tu publicación.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}
