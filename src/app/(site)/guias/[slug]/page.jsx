import { getGuiaBySlug, getAllGuiaSlugs, GUIAS } from '@/utils/guiasData';
import RelatedLinks from '@/components/RelatedLinks';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/utils/site';
import RichText from '@/components/RichText';
import AdSlot from '@/components/ads/AdSlot';

export const dynamicParams = false;

export function generateStaticParams() {
    return getAllGuiaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const guia = getGuiaBySlug(resolvedParams.slug);
    if (!guia) return {};

    return {
        title: `${guia.metaTitle}`,
        description: guia.description,
        openGraph: {
            title: guia.metaTitle,
            description: guia.description,
            url: `https://www.infopeso.com.ar/guias/${guia.slug}`,
            siteName: 'Infopeso',
            locale: 'es_AR',
            type: 'article',
            publishedTime: guia.publishedAt,
            modifiedTime: guia.updatedAt,
            authors: [guia.author],
            images: [{ url: 'https://www.infopeso.com.ar/logo.png', width: 512, height: 512, alt: guia.title }],
        },
        alternates: {
            canonical: `https://www.infopeso.com.ar/guias/${guia.slug}`,
        }
    };
}

export default async function GuiaArticuloPage({ params }) {
    const resolvedParams = await params;
    const guia = getGuiaBySlug(resolvedParams.slug);

    if (!guia) {
        notFound();
    }

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guia.title,
        "description": guia.description,
        "author": {
            "@type": "Organization",
            "name": "Infopeso",
            "url": "https://www.infopeso.com.ar"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Infopeso",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.infopeso.com.ar/logo.png"
            }
        },
        "datePublished": guia.publishedAt,
        "dateModified": guia.updatedAt,
        "mainEntityOfPage": `https://www.infopeso.com.ar/guias/${guia.slug}`
    };

    const faqSchema = guia.faqs && guia.faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": guia.faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
    } : null;

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://www.infopeso.com.ar" },
            { "@type": "ListItem", "position": 2, "name": "Guías", "item": "https://www.infopeso.com.ar/guias" },
            { "@type": "ListItem", "position": 3, "name": guia.title, "item": `https://www.infopeso.com.ar/guias/${guia.slug}` }
        ]
    };

    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
            {faqSchema && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
            )}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />

            <div className="pulso-container" style={{ maxWidth: '880px', paddingTop: 'var(--space-8)' }}>
                {/* Breadcrumb navigation */}
                <nav className="flex items-center gap-2 body-sm mb-6 overflow-x-auto whitespace-nowrap py-1" style={{ color: 'var(--ink-subtle)' }} aria-label="Breadcrumb">
                    <Link href="/" className="hover:underline" style={{ color: 'var(--ink-muted)' }}>Inicio</Link>
                    <span>/</span>
                    <Link href="/guias" className="hover:underline" style={{ color: 'var(--ink-muted)' }}>Guías educativas</Link>
                    <span>/</span>
                    <span className="truncate max-w-[260px]" style={{ color: 'var(--ink)' }}>
                        {guia.title}
                    </span>
                </nav>

                {/* Header info */}
                <header style={{ marginBottom: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div className="flex flex-wrap items-center gap-3">
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
                            {guia.category}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)' }}>
                            {guia.readTime} de lectura
                        </span>
                        <span style={{ color: 'var(--line)' }}>·</span>
                        <time
                            dateTime={guia.updatedAt}
                            style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)' }}
                        >
                            ACTUALIZADO {guia.updatedAt}
                        </time>
                    </div>

                    <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                        {guia.title}
                    </h1>

                    <p className="body" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                        {guia.description}
                    </p>
                </header>

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
                        marginBottom: 'var(--space-6)',
                    }}
                >
                    <strong style={{ color: 'var(--signal-text)' }}>AVISO INFORMATIVO: </strong>
                    Información con fines informativos. No es una recomendación de inversión. El contenido de este artículo tiene carácter estrictamente educativo y no constituye asesoramiento financiero ni oferta de compra o venta bajo la Ley N.º 26.831 de Mercado de Capitales.
                </div>

                {/* Answer-First Box */}
                <div
                    className="pulso-card"
                    style={{
                        borderLeft: '4px solid var(--signal)',
                        marginBottom: 'var(--space-8)',
                    }}
                >
                    <span className="label" style={{ color: 'var(--signal-text)', display: 'block', marginBottom: 'var(--space-2)' }}>
                        Resumen metodológico y conceptual
                    </span>
                    <p className="body" style={{ color: 'var(--ink)', fontWeight: 600, margin: 0 }}>
                        {guia.directAnswer}
                    </p>
                </div>

                {/* Main Content Sections */}
                <article style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', color: 'var(--ink-muted)' }}>
                    {guia.sections.map((sec, idx) => (
                        <section key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            <h2 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                                {sec.heading}
                            </h2>
                            <RichText text={sec.content} />
                        </section>
                    ))}
                </article>

                <AdSlot slot="inContentB" />

                {/* Contextual CTA Banner */}
                {guia.ctaLink && (
                    <div
                        className="pulso-card flex flex-col sm:flex-row items-center justify-between gap-5"
                        style={{ margin: 'var(--space-10) 0' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                            <h3 className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                                Herramientas interactivas de Infopeso
                            </h3>
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                                Probá nuestras calculadoras de cotizaciones y el simulador de cartera con datos en vivo.
                            </p>
                        </div>
                        <Link href={guia.ctaLink} className="pulso-btn pulso-btn--primary shrink-0">
                            {guia.ctaText || 'Abrir herramienta en Infopeso'}
                        </Link>
                    </div>
                )}

                {/* FAQ Section */}
                {guia.faqs && guia.faqs.length > 0 && (
                    <section style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--line)' }}>
                        <h2 className="h2" style={{ color: 'var(--ink)', marginBottom: 'var(--space-4)' }}>
                            Preguntas frecuentes relacionadas
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {guia.faqs.map((faq, idx) => (
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

                <AdSlot slot="multiplex" />

                <RelatedLinks
                    title="Seguí leyendo y usá los datos del día"
                    links={[
                        ...GUIAS.filter((g) => g.slug !== guia.slug).slice(0, 3).map((g) => ({ href: `/guias/${g.slug}`, label: g.metaTitle || g.title })),
                        { href: '/Cambios/dolar-blue', label: 'Dólar blue hoy' },
                        { href: '/RentaFija', label: 'Bonos: precio, TIR y paridad' },
                        { href: '/Empresas', label: 'Acciones y CEDEARs' },
                    ]}
                />

                {/* Author Attribution & Footer Disclaimer */}
                <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="pulso-card flex items-center justify-between body-sm" style={{ color: 'var(--ink-subtle)' }}>
                        <span>Autor: {guia.author}</span>
                        <Link href="/guias" className="hover:underline" style={{ color: 'var(--signal-text)', fontWeight: 600 }}>
                            ← Volver a guías educativas
                        </Link>
                    </div>

                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', textAlign: 'center', margin: 0 }}>
                        Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </div>
        </main>
    );
}
