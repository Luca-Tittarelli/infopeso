import Link from 'next/link';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
    title: 'Página no encontrada',
    robots: { index: false, follow: true },
};

const links = [
    { href: '/Cambios/dolar-blue', label: 'Ver dólar blue hoy' },
    { href: '/Cambios/calculadora-pesos-a-dolar-blue', label: 'Calcular pesos a dólar blue' },
    { href: '/Cambios', label: 'Explorar todas las cotizaciones' },
    { href: '/RentaFija', label: 'Consultar bonos y renta fija' },
    { href: '/Empresas', label: 'Analizar acciones y empresas' },
    { href: '/guias', label: 'Leer guías de inversión' },
];

export default function NotFound() {
    return (
        <>
            <Header />
            <main style={{ minHeight: '100vh', paddingTop: '96px', paddingBottom: 'var(--space-16)' }}>
                <div className="pulso-container" style={{ maxWidth: '720px' }}>
                    <p className="label" style={{ color: 'var(--signal-text)', marginBottom: 'var(--space-2)' }}>
                        ERROR 404
                    </p>
                    <h1 className="h1" style={{ color: 'var(--ink)', marginBottom: 'var(--space-2)' }}>
                        No encontramos esta página
                    </h1>
                    <p className="body" style={{ color: 'var(--ink-muted)', marginBottom: 'var(--space-6)' }}>
                        La dirección que buscás no existe o cambió de ubicación. Probá con alguna de estas secciones:
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 'var(--space-3)', listStyle: 'none', padding: 0, margin: 0 }}>
                        {links.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className="pulso-card pulso-card--interactive block body-sm"
                                    style={{ color: 'var(--signal-text)', fontWeight: 600 }}
                                >
                                    {label} →
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
            <Footer />
        </>
    );
}
