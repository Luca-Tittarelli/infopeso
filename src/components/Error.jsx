import { Button } from './pulso/Button';

export function ErrorComponent({ message, onRetry }) {
    return (
        <div
            className="pulso-card"
            style={{
                maxWidth: '420px',
                marginInline: 'auto',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-3)',
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--ink-muted)' }}
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>

            <div>
                <p className="h2" style={{ color: 'var(--ink)', margin: 0 }}>
                    No pudimos cargar el dato
                </p>
                <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                    {message || 'Intentá actualizar la página en unos segundos.'}
                </p>
            </div>

            {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry}>
                    Reintentar
                </Button>
            )}
        </div>
    );
}
