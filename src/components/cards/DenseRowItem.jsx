import Link from 'next/link';
import { Delta } from '@/components/pulso/Delta';
import { formatCurrency, isValidNumber } from '@/utils/formatters';

export function DenseRowItem({ titulo, valor, valorAnterior, compra, linkTo }) {
    const hasVal = isValidNumber(valor) && Number(valor) > 0;
    const hasPrev = isValidNumber(valorAnterior) && Number(valorAnterior) > 0;
    const diff = hasVal && hasPrev ? ((Number(valor) - Number(valorAnterior)) / Number(valorAnterior)) * 100 : null;

    const content = (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--line)',
                background: 'transparent',
                transition: 'background-color 150ms ease-out',
                cursor: linkTo ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-200)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            <div>
                <span
                    style={{
                        display: 'block',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '15px',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em',
                        color: 'var(--ink)',
                    }}
                >
                    {titulo}
                </span>
                {isValidNumber(compra) && Number(compra) > 0 && (
                    <span
                        style={{
                            display: 'block',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 400,
                            fontSize: '12px',
                            lineHeight: 1.3,
                            color: 'var(--ink-subtle)',
                        }}
                    >
                        Compra {formatCurrency(compra, 'ARS')}
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                {diff !== null && <Delta value={diff} unit="%" compact={true} pill={false} />}
                <span className="data" style={{ color: 'var(--ink)', fontWeight: 500 }}>
                    {hasVal ? formatCurrency(valor, 'ARS') : '—'}
                </span>
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {content}
            </Link>
        );
    }
    return content;
}
