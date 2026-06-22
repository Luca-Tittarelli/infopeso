import EmpresasClient from './EmpresasClient';

export const metadata = {
    title: 'Terminal de Empresas y Fundamentales de Acciones — Infopeso',
    description: 'Análisis fundamental y sentimiento técnico de acciones argentinas (Galicia, YPF, Pampa) e internacionales (Apple, Microsoft, Tesla). balances, ratios y noticias.',
    openGraph: {
        title: 'Terminal de Empresas y Fundamentales de Acciones — Infopeso',
        description: 'Análisis fundamental y sentimiento técnico de acciones argentinas (Galicia, YPF, Pampa) e internacionales (Apple, Microsoft, Tesla). balances, ratios y noticias.',
        url: 'https://infopeso.com/Empresas',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://infopeso.com/logo.png' }],
    },
    alternates: {
        canonical: 'https://infopeso.com/Empresas',
    }
};

export default function Page() {
    return <EmpresasClient />;
}
