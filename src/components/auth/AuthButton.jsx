'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
);

// Acceso a la cuenta en el encabezado. No se muestra si el sitio no tiene Supabase configurado.
export default function AuthButton() {
    const { user, ready, enabled } = useSupabaseUser();
    const pathname = usePathname();
    if (!enabled) return null;

    const loggedIn = Boolean(user);
    const href = loggedIn ? '/cuenta' : '/ingresar';
    const label = loggedIn ? 'Mi cuenta' : 'Ingresar';
    const active = pathname === href;

    // Mantiene el espacio reservado hasta conocer la sesión para que el encabezado no salte.
    const visibility = ready ? 'visible' : 'hidden';

    return (
        <>
            <Link
                href={href}
                className="hidden lg:inline-flex"
                aria-current={active ? 'page' : undefined}
                style={{
                    visibility,
                    alignItems: 'center',
                    minHeight: '44px',
                    padding: '0 var(--space-4)',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--line)',
                    background: active ? 'var(--surface-200)' : 'var(--surface-100)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background-color 150ms ease-out',
                }}
            >
                {label}
            </Link>
            <Link
                href={href}
                className="lg:hidden"
                aria-label={label}
                title={label}
                style={{
                    visibility,
                    width: '44px',
                    height: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--surface-100)',
                    border: '1px solid var(--line)',
                    color: loggedIn ? 'var(--signal-text)' : 'var(--ink)',
                }}
            >
                <UserIcon />
            </Link>
        </>
    );
}
