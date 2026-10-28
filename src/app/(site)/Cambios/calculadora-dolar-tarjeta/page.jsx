import { dolarAPI } from '@/apis';
import CalculadoraTarjetaClient from './CalculadoraTarjetaClient';
import Link from 'next/link';
import { jsonLd } from '@/utils/site';
import AdSlot from '@/components/ads/AdSlot';

export const metadata = {
    title: 'Calculadora Dólar Tarjeta e Impuestos Hoy (Streaming, Netflix, Spotify)',
    description: 'Calculadora online del Dólar Tarjeta hoy en Argentina. Cuánto recarga la percepción de Ganancias sobre el oficial y cuánto cuestan de suscripciones a Netflix, Spotify y Steam en pesos.',
    openGraph: {
        title: 'Calculadora Dólar Tarjeta e Impuestos Hoy (Streaming, Netflix, Spotify)',
        description: 'Calculadora online del Dólar Tarjeta hoy en Argentina. Cuánto recarga la percepción de Ganancias sobre el oficial y cuánto cuestan de suscripciones a Netflix, Spotify y Steam en pesos.',
        url: 'https://www.infopeso.com.ar/Cambios/calculadora-dolar-tarjeta',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/Cambios/calculadora-dolar-tarjeta',
    }
};

async function getDolares() {
    try {
        const res = await fetch(dolarAPI, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export default async function Page() {
    const dolares = await getDolares();
    const dolarOficialData = dolares.find(item => item.casa === 'oficial') || null;
    const tarjetaData = dolares.find(item => item.casa === 'tarjeta') || null;

    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Calculadora Dólar Tarjeta",
        "url": "https://www.infopeso.com.ar/Cambios/calculadora-dolar-tarjeta",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
        "description": "Calculadora impositiva online de consumos en dólares con tarjeta de crédito/débito y servicios de streaming en Argentina."
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "¿Cómo se calcula el Dólar Tarjeta en Argentina?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Se toma la cotización del dólar oficial minorista y se le adicionan los recargos impositivos correspondientes (percepción a cuenta de Ganancias o Bienes Personales, hoy 30%; el Impuesto PAIS dejó de aplicarse en diciembre de 2024)."
                }
            },
            {
                "@type": "Question",
                "name": "¿A qué compras se aplica el Dólar Tarjeta?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Se aplica a todos los consumos realizados en moneda extranjera con tarjeta de crédito o débito, compras en sitios web internacionales, servicios digitales (como Netflix, Spotify, PlayStation, Steam) y pasajes al exterior."
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
            { "@type": "ListItem", "position": 3, "name": "Calculadora Dólar Tarjeta", "item": "https://www.infopeso.com.ar/Cambios/calculadora-dolar-tarjeta" }
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
                        Calculadora Dólar Tarjeta
                    </span>
                </nav>

                <CalculadoraTarjetaClient initialDolar={dolarOficialData} initialTarjeta={tarjetaData} />

                <AdSlot slot="inContentA" />

                {/* Explicación SEO Contextual */}
                <article className="mt-12 pt-8 border-t border-[var(--border-subtle)] space-y-6">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                        ¿Cómo calcular impuestos en compras en dólares?
                    </h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Los consumos realizados en moneda extranjera con tarjeta en Argentina se liquidan al dólar oficial minorista del banco emisor más los recargos impositivos dictaminados por la AFIP. Al calcular el valor final en tu resumen bancario, podés usar nuestra herramienta interactiva para conocer el monto exacto en pesos.
                    </p>
                </article>
            </section>
        <AdSlot slot="multiplex" />

                </main>
    );
}
