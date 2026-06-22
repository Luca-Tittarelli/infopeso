import EconomiaClient from './EconomiaClient';

export const metadata = {
    title: 'Indicadores Macroeconómicos de Argentina — Tasas, Reservas, Inflación — Infopeso',
    description: 'Seguimiento en tiempo real de los indicadores económicos clave de Argentina: inflación (INDEC), reservas del BCRA, tasa de política monetaria, PBI y base monetaria.',
    openGraph: {
        title: 'Indicadores Macroeconómicos de Argentina — Tasas, Reservas, Inflación — Infopeso',
        description: 'Seguimiento en tiempo real de los indicadores económicos clave de Argentina: inflación (INDEC), reservas del BCRA, tasa de política monetaria, PBI y base monetaria.',
        url: 'https://infopeso.com/Economia',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://infopeso.com/logo.png' }],
    },
    alternates: {
        canonical: 'https://infopeso.com/Economia',
    }
};

export default function Page() {
    return <EconomiaClient />;
}
