'use client';

import Link from 'next/link';
import { useTheme } from '../hooks/useTheme';

export function Footer() {
    const [theme, , mounted] = useTheme();
    const currentYear = new Date().getFullYear();
    const currentTheme = mounted ? theme : 'dark';
    const logoSrc =
        currentTheme === 'light'
            ? '/assets/Logos/logo-principal-sobre-claro.svg'
            : '/assets/Logos/logo-principal-sobre-oscuro.svg';

    return (
        <footer
            style={{
                marginTop: 'var(--space-16)',
                paddingBottom: 'var(--space-16)',
                borderTop: '1px solid var(--line)',
                background: 'var(--surface-100)',
                color: 'var(--ink-muted)',
            }}
        >
            <div
                className="pulso-container"
                style={{
                    paddingTop: 'var(--space-12)',
                    paddingBottom: 'var(--space-12)',
                }}
            >
                {/* Bloque principal */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 'var(--space-8)',
                        paddingBottom: 'var(--space-12)',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    {/* Col 1: Marca */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Link href="/" aria-label="Infopeso" style={{ display: 'inline-block', paddingBlock: 'var(--space-1)' }}>
                            <img
                                src={logoSrc}
                                alt="Infopeso"
                                width={124}
                                height={30}
                                style={{ width: '124px', height: 'auto', display: 'block' }}
                            />
                        </Link>
                        <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                            Seguí el dólar, la inflación, el mercado y tu cartera en pesos y dólares. Datos claros, alineados y verificables en tiempo real.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                            <a
                                href="https://x.com/infopeso"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="body-sm"
                                style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 700 }}
                            >
                                @infopeso en X →
                            </a>
                            <Link
                                href="/widgets"
                                className="body-sm"
                                style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}
                            >
                                Widgets para tu web →
                            </Link>
                        </div>
                    </div>

                    {/* Col 2: Fuentes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <h3 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Fuentes verificables
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {[
                                { label: 'BCRA — Estadísticas monetarias', href: 'https://www.bcra.gob.ar/' },
                                { label: 'INDEC — Índice de precios (IPC)', href: 'https://www.indec.gob.ar/' },
                                { label: 'DolarAPI — Cotizaciones cambiarias', href: 'https://dolarapi.com/' },
                                { label: 'ArgentinaDatos — Series históricas', href: 'https://argentinadatos.com/' },
                                { label: 'BYMA / TradingView — Mercado', href: 'https://www.tradingview.com/' },
                            ].map(({ label, href }) => (
                                <li key={href}>
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="body-sm"
                                        style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}
                                    >
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Col 3: Accesos directos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <h3 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                            Tu cartera en Infopeso
                        </h3>
                        <div
                            style={{
                                padding: 'var(--space-6)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--ground-000)',
                                border: '1px solid var(--line)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-3)',
                            }}
                        >
                            <p className="h2" style={{ margin: 0, color: 'var(--ink)' }}>
                                ¿Tu plata le ganó a la inflación?
                            </p>
                            <p className="body-sm" style={{ margin: 0, color: 'var(--ink-muted)' }}>
                                Armá tu cartera de acciones argentinas y CEDEARs para seguir valuación, dividendos y noticias.
                            </p>
                            <div>
                                <Link href="/Cartera" className="pulso-btn pulso-btn-secondary pulso-btn-sm">
                                    Ver mi cartera →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grilla de enlaces internos SEO */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'var(--space-6)',
                        paddingTop: 'var(--space-8)',
                        paddingBottom: 'var(--space-8)',
                        borderBottom: '1px solid var(--line)',
                    }}
                >
                    <div>
                        <h4 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                            Dólar y divisas
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <li><Link href="/Cambios/dolar-blue" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar Blue hoy</Link></li>
                            <li><Link href="/Cambios/dolar-mep" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar MEP (Bolsa)</Link></li>
                            <li><Link href="/Cambios/dolar-ccl" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar CCL</Link></li>
                            <li><Link href="/Cambios/dolar-oficial" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar Oficial BNA</Link></li>
                            <li><Link href="/Cambios/dolar-tarjeta" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar Tarjeta</Link></li>
                            <li><Link href="/Cambios/euro" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Euro Oficial</Link></li>
                            <li><Link href="/Cambios/real" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Real Brasileño</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                            Macro y bonos
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <li><Link href="/Economia/riesgo-pais" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Riesgo país</Link></li>
                            <li><Link href="/Economia/27" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Inflación mensual INDEC</Link></li>
                            <li><Link href="/Economia/1" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Reservas BCRA</Link></li>
                            <li><Link href="/Economia/15" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Base monetaria</Link></li>
                            <li><Link href="/RentaFija/AL30" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bono AL30</Link></li>
                            <li><Link href="/RentaFija/GD30" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bono GD30</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                            Guías para invertir
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <li><Link href="/guias" className="body-sm" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}>Ver todas las guías →</Link></li>
                            <li><Link href="/guias/armar-cartera-inversiones-argentina" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Cómo armar una cartera</Link></li>
                            <li><Link href="/guias/que-son-cedears-como-invertir" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Qué son los CEDEARs</Link></li>
                            <li><Link href="/guias/dolar-mep-vs-ccl-vs-blue" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Dólar MEP vs CCL vs Blue</Link></li>
                            <li><Link href="/guias/bonos-argentinos-al30-vs-gd30" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Bonos AL30 vs GD30</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="label" style={{ color: 'var(--ink-subtle)', marginBottom: 'var(--space-3)', marginTop: 0 }}>
                            Herramientas
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <li><Link href="/Cartera" className="body-sm" style={{ color: 'var(--ink)', fontWeight: 700, textDecoration: 'none' }}>Cargá tu cartera</Link></li>
                            <li><Link href="/Cambios/calculadora-pesos-a-dolar-blue" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Calculadora dólar blue</Link></li>
                            <li><Link href="/Cambios/calculadora-dolar-tarjeta" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Calculadora dólar tarjeta</Link></li>
                            <li><Link href="/Empresas" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Panel de empresas</Link></li>
                            <li><Link href="/Mercado" className="body-sm" style={{ color: 'var(--ink-muted)', textDecoration: 'none' }}>Panel de mercado</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Pie legal */}
                <div
                    style={{
                        paddingTop: 'var(--space-6)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                            © {currentYear} INFOPESO
                        </span>
                        <Link href="/privacidad" className="body-sm" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Privacidad</Link>
                        <Link href="/terminos" className="body-sm" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Términos</Link>
                        <Link href="/contacto" className="body-sm" style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}>Contacto</Link>
                    </div>
                    <p className="body-sm" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                        Información con fines informativos. No es una recomendación de inversión.
                    </p>
                </div>
            </div>
        </footer>
    );
}
