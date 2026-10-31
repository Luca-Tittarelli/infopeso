export function Loading() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                paddingBlock: 'var(--space-12)',
            }}
        >
            <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                CARGANDO DATOS…
            </p>
        </div>
    );
}
