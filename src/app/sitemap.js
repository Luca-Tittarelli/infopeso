import { variablesMetadata } from '@/utils/variablesMetadata';

export default function sitemap() {
    const base = 'https://infopeso.com';
    const today = new Date();

    const staticRoutes = ['', '/Cambios', '/Economia', '/Mercado', '/RentaFija', '/Empresas']
        .map(route => ({
            url: `${base}${route}`,
            lastModified: today,
            changeFrequency: route === '' ? 'always' : 'daily',
            priority: route === '' ? 1.0 : 0.8,
        }));

    const dynamicRoutes = Object.keys(variablesMetadata).map(id => ({
        url: `${base}/Economia/${id}`,
        lastModified: today,
        changeFrequency: 'daily',
        priority: 0.6,
    }));

    return [...staticRoutes, ...dynamicRoutes];
}
