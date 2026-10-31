import { dolarAPI } from '@/apis';
import { formatNumber } from '@/utils/formatters';

async function getDolares() {
    try {
        const res = await fetch(dolarAPI, { next: { revalidate: 60 } });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export default async function MultiDolarWidgetPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const isLight = resolvedParams?.theme === 'light';
    const dolares = await getDolares();

    const list = [
        { name: 'Dólar blue', key: 'blue' },
        { name: 'Dólar oficial', key: 'oficial' },
        { name: 'Dólar MEP', key: 'bolsa' },
        { name: 'Dólar CCL', key: 'contadoconliqui' },
        { name: 'Dólar tarjeta', key: 'tarjeta' },
    ];

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Monitor de divisas</span>
                    <span
                        className="label"
                        style={{
                            fontSize: '9px',
                            background: 'var(--surface-200)',
                            color: 'var(--signal-text)',
                            padding: '2px 5px',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    >
                        EN VIVO
                    </span>
                </div>
                <a
                    href="https://www.infopeso.com.ar/Cambios"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--signal-text)', textDecoration: 'none', fontWeight: 600 }}
                >
                    Infopeso ↗
                </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {list.map((item) => {
                    const data = dolares.find(d => d.casa === item.key);
                    return (
                        <div
                            key={item.key}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--surface-100)',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--line)',
                            }}
                        >
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)' }}>{item.name}</span>
                            <div className="data" style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '9px', color: 'var(--ink-subtle)', marginRight: '3px' }}>C:</span>
                                    <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>
                                        {data?.compra ? `$ ${formatNumber(data.compra, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '9px', color: 'var(--ink-subtle)', marginRight: '3px' }}>V:</span>
                                    <span style={{ color: item.key === 'blue' ? 'var(--signal-text)' : 'var(--ink)', fontWeight: 600 }}>
                                        {data?.venta ? `$ ${formatNumber(data.venta, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '10px', color: 'var(--ink-subtle)' }}>
                <span>Actualización permanente</span>
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
