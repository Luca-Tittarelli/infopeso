import MercadoClient from './MercadoClient';

export const metadata = {
    title: 'Mercado Financiero en Tiempo Real — Acciones, Merval, Criptomonedas',
    description: 'Cotizaciones en tiempo real del S&P Merval, acciones argentinas, CEDEARs, mercados internacionales (S&P 500, Nasdaq), criptomonedas y commodities clave.',
    openGraph: {
        title: 'Mercado Financiero en Tiempo Real — Acciones, Merval, Criptomonedas',
        description: 'Cotizaciones en tiempo real del S&P Merval, acciones argentinas, CEDEARs, mercados internacionales (S&P 500, Nasdaq), criptomonedas y commodities clave.',
        url: 'https://www.infopeso.com.ar/Mercado',
        siteName: 'Infopeso',
        locale: 'es_AR',
        type: 'website',
        images: [{ url: 'https://www.infopeso.com.ar/logo.png' }],
    },
    alternates: {
        canonical: 'https://www.infopeso.com.ar/Mercado',
    }
};

export default function Page() {
    return <MercadoClient />;
}
