'use client';

import Link from 'next/link';
import { track } from '@/lib/track';

const linkStyle = {
    color: 'var(--signal-text)',
    fontWeight: 500,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
};

const SYNC_LABEL = {
    saving: 'Guardando…',
    saved: 'Guardada',
    error: 'Sin sincronizar',
};

// Franja bajo el encabezado: invita a crear una cuenta o avisa algo de la sincronización. Con sesión y todo
// guardado no aparece (el estado va en la línea de brokers, ver CarteraReal).
export default function CarteraAccountBar({ user, syncState, imported, onRetry }) {
    if (user && syncState !== 'error' && !imported) return null;
    return (
        <div>
            <div
                role="status"
                className="body-sm"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 'var(--space-2) var(--space-4)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--surface-100)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--ink-muted)',
                }}
            >
                {user ? (
                    <>
                        <span>
                            Cartera guardada en tu cuenta <span className="data" style={{ color: 'var(--ink)' }}>{user.email}</span>
                        </span>
                        {SYNC_LABEL[syncState] && (
                            <span className="source-badge" style={syncState === 'error' ? { color: 'var(--signal-text)' } : undefined}>
                                {SYNC_LABEL[syncState]}
                            </span>
                        )}
                        {syncState === 'error' && (
                            <>
                                <span>No pudimos conectar con tu cuenta, tus cambios no se están guardando.</span>
                                <button type="button" onClick={onRetry} className="pulso-btn pulso-btn-ghost pulso-btn-sm">
                                    Reintentar
                                </button>
                            </>
                        )}
                        {imported && <span>Importamos la cartera que tenías en este navegador a tu cuenta.</span>}
                        <Link href="/cuenta" style={{ ...linkStyle, marginLeft: 'auto' }}>
                            Mi cuenta
                        </Link>
                    </>
                ) : (
                    <>
                        <span>Tu cartera se guarda solo en este navegador.</span>
                        <span>
                            <Link href="/registro?next=/Cartera" style={linkStyle} onClick={() => track('signup_cta', { location: 'barra' })}>
                                Creá una cuenta gratis
                            </Link>{' '}
                            para ver cómo evoluciona en dólares, recibir un resumen semanal y tenerla en todos tus dispositivos, o{' '}
                            <Link href="/ingresar?next=/Cartera" style={linkStyle}>
                                ingresá
                            </Link>
                            .
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
