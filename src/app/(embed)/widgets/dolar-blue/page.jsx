import { dolarAPI } from '@/apis';
import { formatNumber } from '@/utils/formatters';

async function getDolarBlue() {
    try {
        const res = await fetch(dolarAPI, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data.find(item => item.casa === 'blue') || null;
    } catch {
        return null;
    }
}

export default async function DolarBlueWidgetPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const isLight = resolvedParams?.theme === 'light';
    const blue = await getDolarBlue();

    return (
        <div
            data-theme={isLight ? 'light' : 'dark'}
            style={{
                background: 'var(--ground-000)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-sans)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
                boxSizing: 'border-box',
                userSelect: 'none',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>Dólar blue</span>
                    <span
                        className="label"
                        style={{
                            fontSize: '10px',
                            background: 'var(--surface-200)',
                            color: 'var(--signal-text)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    >
                        EN VIVO
                    </span>
                </div>
                <a
                    href="https://www.infopeso.com.ar/Cambios/dolar-blue"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--signal-text)', textDecoration: 'none', fontWeight: 600 }}
                >
                    Infopeso ↗
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--surface-100)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                    <div className="label" style={{ fontSize: '10px', color: 'var(--ink-subtle)' }}>Compra</div>
                    <div className="data" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginTop: '2px' }}>
                        {blue?.compra ? `$ ${formatNumber(blue.compra, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </div>
                </div>
                <div style={{ background: 'var(--surface-100)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                    <div className="label" style={{ fontSize: '10px', color: 'var(--ink-subtle)' }}>Venta</div>
                    <div className="data" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--signal-text)', marginTop: '2px' }}>
                        {blue?.venta ? `$ ${formatNumber(blue.venta, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '10px', color: 'var(--ink-subtle)' }}>
                <span>Actualizado hace instantes</span>
                <a
                    href="https://www.infopeso.com.ar"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ink-subtle)', textDecoration: 'none' }}
                >
                    Por <strong style={{ color: 'var(--ink)' }}>Infopeso</strong>
                </a>
            </div>
        </div>
    );
}
