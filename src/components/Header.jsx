'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../hooks/useTheme';
import AuthButton from './auth/AuthButton';

const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="4" x2="20" y1="12" y2="12" />
        <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const DESKTOP_LINKS = [
    { to: '/', label: 'Inicio' },
    { to: '/Cambios', label: 'Dólar' },
    { to: '/Economia', label: 'Inflación y Macro' },
    { to: '/Mercado', label: 'Mercado' },
    { to: '/RentaFija', label: 'Bonos' },
    { to: '/Empresas', label: 'Empresas' },
    { to: '/guias', label: 'Guías' },
    { to: '/Cartera', label: 'Mi cartera' },
];

// Regla manual de marca: navegación inferior en mobile tiene cuatro pestañas como máximo
const MOBILE_TABS = [
    {
        to: '/',
        label: 'Inicio',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
        ),
    },
    {
        to: '/Cambios',
        label: 'Dólar',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
    {
        to: '/Economia',
        label: 'Macro',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3v16a2 2 0 0 0 2 2h16" />
                <path d="M18 17V9" />
                <path d="M13 17V5" />
                <path d="M8 17v-3" />
            </svg>
        ),
    },
    {
        to: '/Cartera',
        label: 'Cartera',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                <rect width="20" height="14" x="2" y="6" rx="2" />
            </svg>
        ),
    },
];

export default function Header() {
    const [theme, changeTheme, mounted] = useTheme();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const currentTheme = mounted ? theme : 'dark';
    const logoSrc =
        currentTheme === 'light'
            ? '/assets/Logos/logo-principal-sobre-claro.svg'
            : '/assets/Logos/logo-principal-sobre-oscuro.svg';

    const isActive = (path) => (path === '/' ? pathname === '/' : pathname?.startsWith(path));

    return (
        <>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'var(--ground-000)',
                    borderBottom: '1px solid var(--line)',
                }}
            >
                <div
                    className="pulso-container"
                    style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)',
                    }}
                >
                    {/* Logo: entre 120 y 140 px de ancho, con área de resguardo */}
                    <Link
                        href="/"
                        aria-label="Infopeso — Ir al inicio"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            paddingBlock: 'var(--space-2)',
                            paddingRight: 'var(--space-2)',
                            flexShrink: 0,
                        }}
                    >
                        <img
                            src={logoSrc}
                            alt="Infopeso"
                            width={132}
                            height={32}
                            style={{ width: '132px', height: 'auto', display: 'block' }}
                        />
                    </Link>

                    {/* Navegación Desktop */}
                    <nav
                        aria-label="Navegación principal"
                        className="hidden lg:flex"
                        style={{
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                        }}
                    >
                        {DESKTOP_LINKS.map(({ to, label }) => {
                            const active = isActive(to);
                            return (
                                <Link
                                    key={to}
                                    href={to}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        minHeight: '44px',
                                        padding: '0 var(--space-3)',
                                        borderRadius: 'var(--radius-pill)',
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '14px',
                                        fontWeight: active ? 700 : 400,
                                        color: active ? 'var(--ink)' : 'var(--ink-muted)',
                                        background: active ? 'var(--surface-200)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'background-color 150ms ease-out, color 150ms ease-out',
                                    }}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Controles derecha: Tema + Menú mobile */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <AuthButton />
                        <button
                            type="button"
                            onClick={changeTheme}
                            aria-label={currentTheme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
                            title={currentTheme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
                            style={{
                                width: '44px',
                                height: '44px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-pill)',
                                background: 'var(--surface-100)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)',
                                cursor: 'pointer',
                                transition: 'background-color 150ms ease-out',
                            }}
                        >
                            {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            aria-label={mobileMenuOpen ? 'Cerrar menú de secciones' : 'Abrir menú de secciones'}
                            aria-expanded={mobileMenuOpen}
                            className="lg:hidden"
                            style={{
                                width: '44px',
                                height: '44px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'var(--radius-pill)',
                                background: 'var(--surface-100)',
                                border: '1px solid var(--line)',
                                color: 'var(--ink)',
                                cursor: 'pointer',
                            }}
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>

                {/* Panel desplegable mobile para todas las secciones */}
                {mobileMenuOpen && (
                    <nav
                        aria-label="Todas las secciones"
                        className="lg:hidden"
                        style={{
                            background: 'var(--surface-100)',
                            borderTop: '1px solid var(--line)',
                            padding: 'var(--space-4)',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: 'var(--space-2)',
                            }}
                        >
                            {DESKTOP_LINKS.map(({ to, label }) => {
                                const active = isActive(to);
                                return (
                                    <Link
                                        key={to}
                                        href={to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            minHeight: '44px',
                                            padding: '0 var(--space-4)',
                                            borderRadius: 'var(--radius-pill)',
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '14px',
                                            fontWeight: active ? 700 : 400,
                                            color: active ? 'var(--ink)' : 'var(--ink-muted)',
                                            background: active ? 'var(--surface-200)' : 'transparent',
                                            border: '1px solid var(--line)',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </header>

            {/* Navegación inferior en mobile: estrictamente 4 pestañas, áreas táctiles >= 44x44 px */}
            <nav
                aria-label="Navegación rápida móvil"
                className="lg:hidden"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: 'var(--ground-000)',
                    borderTop: '1px solid var(--line)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        maxWidth: '520px',
                        marginInline: 'auto',
                    }}
                >
                    {MOBILE_TABS.map(({ to, label, icon }) => {
                        const active = isActive(to);
                        return (
                            <Link
                                key={to}
                                href={to}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '56px',
                                    minWidth: '44px',
                                    gap: 'var(--space-1)',
                                    color: active ? 'var(--ink)' : 'var(--ink-muted)',
                                    textDecoration: 'none',
                                    position: 'relative',
                                }}
                            >
                                {active && (
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            width: '24px',
                                            height: '2px',
                                            background: 'var(--signal)',
                                        }}
                                    />
                                )}
                                {icon}
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '11px',
                                        fontWeight: active ? 500 : 400,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
