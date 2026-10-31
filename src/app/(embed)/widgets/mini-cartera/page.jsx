import { CATEGORIES } from '@/utils/carteraData';

export default async function MiniCarteraWidgetPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const isLight = resolvedParams?.theme === 'light';

    const featuredSymbols = ['YPFD.BA', 'GGAL.BA', 'VIST', 'AAPL'];
    const allCompanies = CATEGORIES.flatMap(c => c.companies);
    const featured = featuredSymbols.map(sym => allCompanies.find(c => c.symbol === sym)).filter(Boolean);

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
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Seguimiento de cartera</span>
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
                        GRATIS
                    </span>
                </div>
                <a
                    href="https://www.infopeso.com.ar/Cartera"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: 'var(--signal-text)', textDecoration: 'none', fontWeight: 600 }}
                >
                    Armar cartera ↗
                </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {featured.map((item) => (
                    <a
                        key={item.symbol}
                        href={`https://www.infopeso.com.ar/Empresas/${encodeURIComponent(item.symbol)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'var(--surface-100)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--line)',
                            textDecoration: 'none',
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)' }}>{item.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>{item.sector}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className="data" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--signal-text)' }}>
                                {item.symbol}
                            </div>
                            <div style={{ fontSize: '9px', color: 'var(--ink-subtle)' }}>Ver análisis →</div>
                        </div>
                    </a>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '10px', color: 'var(--ink-subtle)' }}>
                <span>Diagnósticos sin registro</span>
                <a
                    href="https://www.infopeso.com.ar/Cartera"
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
