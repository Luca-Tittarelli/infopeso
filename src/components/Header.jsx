'use client';

import { useEffect, useState } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../hooks/useTheme';

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export default function Header() {
    const [theme, changeTheme] = useTheme();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Sync HTML class on initial mount and theme change
    useEffect(() => {
        setMounted(true);
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const navLinks = [
        { to: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { to: '/Economia', label: 'Macro', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { to: '/Mercado', label: 'Mercado', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { to: '/RentaFija', label: 'Bonos', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { to: '/Cambios', label: 'Divisas', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { to: '/Empresas', label: 'Empresas', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    ];

    const isActive = (path) =>
        path === '/' ? pathname === '/' : pathname?.startsWith(path);

    // Prevent mismatch during hydration
    const currentTheme = mounted ? theme : "dark";

    return (
        <>
            {/* ── Main Header ───────────────────────────────── */}
            <header
                className="h-14 w-full fixed top-0 z-50 flex items-center justify-between px-5 sm:px-8"
                style={{
                    background: 'var(--header-bg)',
                    borderBottom: '1px solid var(--header-border)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                }}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 active:scale-[0.98] transition-transform">
                    <img
                        src={currentTheme === 'dark' ? '/white-logo.avif' : '/logo.avif'}
                        alt="Infopeso"
                        className="h-8"
                        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.10))' }}
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            href={to}
                            className={`nav-link px-3 py-1.5 rounded-md ${isActive(to) ? 'active' : ''}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Theme toggle */}
                <button
                    onClick={changeTheme}
                    aria-label={currentTheme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90"
                    style={{
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                    }}
                >
                    <span style={{ display: 'block', transition: 'transform 0.35s ease', transform: currentTheme === 'dark' ? 'rotate(20deg)' : 'rotate(0deg)' }}>
                        {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                    </span>
                </button>
            </header>

            {/* ── Bottom Tab Bar — Mobile ────────────────────── */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 pt-2"
                style={{
                    background: 'var(--header-bg)',
                    borderTop: '1px solid var(--header-border)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 8px)',
                }}
            >
                {navLinks.map(({ to, label, icon }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            href={to}
                            className="flex flex-col items-center justify-center w-full py-1 gap-1 relative active:scale-95 transition-transform"
                            style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}
                        >
                            {active && (
                                <span
                                    className="absolute inset-0 mx-auto rounded-xl -z-10"
                                    style={{ width: '48px', height: '44px', top: '-4px', background: 'var(--accent-soft)' }}
                                />
                            )}
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? "2.2" : "1.7"} className="transition-all duration-200">
                                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                            </svg>
                            <span className="text-[10px] font-medium tracking-tight">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
