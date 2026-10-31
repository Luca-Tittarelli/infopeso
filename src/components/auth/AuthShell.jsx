// Marco común de las pantallas de cuenta: tarjeta centrada con encabezado y pie de enlaces.
export default function AuthShell({ eyebrow, title, intro, children, footer, maxWidth = '480px' }) {
    return (
        <main style={{ minHeight: '100vh', paddingTop: '56px', paddingBottom: 'var(--space-16)' }}>
            <div className="pulso-container" style={{ maxWidth, paddingTop: 'var(--space-12)' }}>
                <article className="pulso-card-lg" style={{ padding: 'var(--space-8)' }}>
                    {eyebrow && (
                        <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-2) 0' }}>
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="h1" style={{ color: 'var(--ink)', margin: '0 0 var(--space-3) 0' }}>
                        {title}
                    </h1>
                    {intro && (
                        <p className="body" style={{ color: 'var(--ink-muted)', margin: '0 0 var(--space-6) 0' }}>
                            {intro}
                        </p>
                    )}
                    {children}
                    {footer && (
                        <div
                            style={{
                                marginTop: 'var(--space-6)',
                                paddingTop: 'var(--space-4)',
                                borderTop: '1px solid var(--line)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-2)',
                            }}
                        >
                            {footer}
                        </div>
                    )}
                </article>
            </div>
        </main>
    );
}

// Aviso con borde de acento: confirmaciones y errores de formulario.
export function Callout({ children, role = 'status' }) {
    return (
        <p
            role={role}
            className="body-sm"
            style={{
                margin: 0,
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--surface-200)',
                borderLeft: '2px solid var(--signal)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--ink)',
            }}
        >
            {children}
        </p>
    );
}

// Se muestra mientras el proyecto no tenga configuradas las variables de Supabase.
export function AuthDisabled() {
    return (
        <AuthShell
            eyebrow="CUENTAS"
            title="Cuentas no disponibles"
            intro="Todavía no están habilitadas las cuentas en este sitio. Mientras tanto podés usar la cartera sin registrarte: se guarda en tu navegador."
        />
    );
}
