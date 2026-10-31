export function LoadingCard() {
    return (
        <article
            className="pulso-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
            }}
        >
            <div className="skeleton" style={{ height: '14px', width: '50%' }} />
            <div className="skeleton" style={{ height: '40px', width: '70%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ height: '26px', width: '80px', borderRadius: 'var(--radius-pill)' }} />
                <div className="skeleton" style={{ height: '12px', width: '64px' }} />
            </div>
        </article>
    );
}
