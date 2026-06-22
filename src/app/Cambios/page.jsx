import CambiosClient from './CambiosClient';

export const metadata = {
    title: 'Cotizaciones del Dólar Hoy en Argentina — Oficial, Blue, MEP, CCL — Infopeso',
    description: 'Cotizaciones actualizadas del dólar en Argentina: Oficial, Blue, CCL, MEP y otras monedas en tiempo real. Datos provistos por DolarAPI y ArgentinaDatos.',
    openGraph: {
        title: 'Cotizaciones del Dólar Hoy en Argentina — Oficial, Blue, MEP, CCL — Infopeso',
        description: 'Cotizaciones actualizadas del dólar en Argentina: Oficial, Blue, CCL, MEP y otras monedas en tiempo real. Datos provistos por DolarAPI y ArgentinaDatos.',
        url: 'https://infopeso.com/Cambios',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://infopeso.com/logo.png' }],
    },
    alternates: {
        canonical: 'https://infopeso.com/Cambios',
    }
};

export default function Page() {
    return <CambiosClient />;
}
