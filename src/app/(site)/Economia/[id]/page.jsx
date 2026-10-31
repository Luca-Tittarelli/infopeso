import { getVariableMetadata, variablesMetadata } from '@/utils/variablesMetadata';
import EconomiaDetalleClient from './EconomiaDetalleClient';
import Link from 'next/link';
import { jsonLd } from '@/utils/site';
import { variableAPI, RiesgoPaisHistoricoAPI } from '@/apis';
import { getTodayDate } from '@/utils/functions';

async function getInitialSeries(id) {
    try {
        if (id === 'riesgo-pais') {
            const res = await fetch(RiesgoPaisHistoricoAPI, { next: { revalidate: 3600 } });
            if (!res.ok) return null;
            return (await res.json()).slice(-400);
        }
        const from = new Date();
        from.setFullYear(from.getFullYear() - 1);
        const res = await fetch(variableAPI(id, from.toISOString().slice(0, 10), getTodayDate()), { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const detalle = (await res.json()).results?.[0]?.detalle;
        return detalle?.length ? [...detalle].reverse() : null;
    } catch {
        return null;
    }
}

export const dynamicParams = false;

export function generateStaticParams() {
    return Object.keys(variablesMetadata).map((id) => ({ id }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const meta = getVariableMetadata(id);
    return {
        title: meta.title,
        description: meta.description,
        openGraph: {
            title: meta.title,
            description: meta.description,
            url: `https://www.infopeso.com.ar/Economia/${id}`,
            siteName: "Infopeso",
            locale: "es_AR",
            type: "website",
            images: [{ url: "https://www.infopeso.com.ar/logo.png" }],
        },
        alternates: {
            canonical: `https://www.infopeso.com.ar/Economia/${id}`,
        }
    };
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const meta = getVariableMetadata(id);
    const initialData = await getInitialSeries(id);

    const datasetSchema = meta.dataset ? {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": meta.dataset.name,
        "description": meta.description,
        "url": `https://www.infopeso.com.ar/Economia/${id}`,
        "creator": {
            "@type": "Organization",
            "name": "Infopeso"
        },
        "temporalCoverage": "2020-01-01/.."
    } : null;

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

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Economía", "item": "https://www.infopeso.com.ar/Economia" },
            { "@type": "ListItem", "position": 3, "name": meta.title.split('—')[0].trim(), "item": `https://www.infopeso.com.ar/Economia/${id}` }
        ]
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            {datasetSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(datasetSchema) }} />
            )}
            {faqSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
            )}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

            <section className="pulso-container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-6" aria-label="Breadcrumb">
                    <Link
                        href="/Economia"
                        className="flex items-center gap-1.5 body-sm hover:underline"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Economía
                    </Link>
                    <span style={{ color: 'var(--line)' }}>/</span>
                    <span className="body-sm" style={{ color: 'var(--ink-subtle)' }}>
                        {meta.title.split('—')[0].trim()}
                    </span>
                </nav>

                <EconomiaDetalleClient id={id} meta={meta} initialData={initialData} />

                {meta.faqs && meta.faqs.length > 0 && (
                    <section style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--line)' }}>
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                            Información y contexto económico
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

                        <h2 className="h2" style={{ color: 'var(--ink)', marginTop: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
                            Preguntas frecuentes
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {meta.faqs.map((faq, idx) => (
                                <div key={idx} className="pulso-card">
                                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                                        {faq.question}
                                    </h3>
                                    <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </section>
        </main>
    );
}
