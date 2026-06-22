import IndexClient from './IndexClient';

export const metadata = {
    title: 'Infopeso — Dashboard Financiero',
    description: 'Dashboard financiero argentino. Estado del sistema económico, tasas, reservas, riesgo país y tipo de cambio en tiempo real.',
    openGraph: {
        title: 'Infopeso — Dashboard Financiero',
        description: 'Dashboard financiero argentino. Estado del sistema económico, tasas, reservas, riesgo país y tipo de cambio en tiempo real.',
        url: 'https://infopeso.com',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://infopeso.com/logo.png' }],
    },
    alternates: {
        canonical: 'https://infopeso.com',
    }
};

export default function Page() {
    return <IndexClient />;
}
