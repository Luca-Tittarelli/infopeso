import { dolarAPI } from '@/apis';
import { formatNumber } from '@/utils/formatters';

async function getDolarData() {
    try {
        const res = await fetch(dolarAPI, { next: { revalidate: 60 } });
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return [];
    }
}

export const metadata = {
    title: 'Widget Dólar Hoy',
    robots: { index: false, follow: false }
};

export default async function Page({ searchParams }) {
    const resolvedParams = await searchParams;
    const isLight = resolvedParams?.theme === 'light';
    const data = await getDolarData();
    const blue = data.find(item => item.casa === 'blue');
    const mep = data.find(item => item.casa === 'bolsa');

    return (
        <div
            data-theme={isLight ? 'light' : 'dark'}
            style={{
                margin: 0,
                padding: 'var(--space-3)',
                background: 'var(--ground-000)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-sans)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 'calc(100vh - 24px)',
                boxSizing: 'border-box',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--line)',
                    paddingBottom: '6px',
                    marginBottom: '8px',
                }}
            >
                <span className="label" style={{ color: 'var(--ink-subtle)' }}>Cotizaciones hoy</span>
                <a
                    href="https://www.infopeso.com.ar/Cambios/dolar-blue"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', fontWeight: 700, color: 'var(--signal-text)', textDecoration: 'none' }}
                >
                    Infopeso
                </a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexGrow: 1 }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="label" style={{ color: 'var(--ink-subtle)', marginBottom: '2px' }}>Dólar blue</div>
                    <div className="data" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                        {blue?.venta ? `$ ${formatNumber(blue.venta, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div className="label" style={{ color: 'var(--ink-subtle)', marginBottom: '2px' }}>Dólar MEP</div>
                    <div className="data" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
                        {mep?.venta ? `$ ${formatNumber(mep.venta, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                    </div>
                </div>
            </div>
        </div>
    );
}
