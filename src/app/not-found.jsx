import Link from 'next/link';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
    title: 'Página no encontrada',
    robots: { index: false, follow: true },
};

const links = [
    { href: '/Cambios/dolar-blue', label: 'Dólar blue hoy' },
    { href: '/Cambios/calculadora-pesos-a-dolar-blue', label: 'Calculadora de pesos a dólar blue' },
    { href: '/Cambios', label: 'Todas las cotizaciones' },
    { href: '/RentaFija', label: 'Bonos y renta fija' },
    { href: '/Empresas', label: 'Acciones y empresas' },
    { href: '/guias', label: 'Guías de inversión' },
];

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="min-h-screen pt-24 pb-24 px-5 sm:px-8 max-w-[720px] mx-auto">
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                    No encontramos esta página
                </h1>
                <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                    La dirección no existe o cambió. Probá con alguna de estas secciones:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {links.map(({ href, label }) => (
                        <li key={href}>
                            <Link href={href} className="block p-3 rounded-xl text-sm hover:underline" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--accent)' }}>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
            <Footer />
        </>
    );
}
