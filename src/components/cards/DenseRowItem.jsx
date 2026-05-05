import { Link } from "react-router-dom";

export function DenseRowItem({ titulo, valor, valorAnterior, label = "ARS/USD", linkTo }) {
    const isPositive = valor && valorAnterior && valor > valorAnterior;
    const isNegative = valor && valorAnterior && valor < valorAnterior;
    const diffColor  = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';
    const diffBg     = isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)';
    const diff       = valor && valorAnterior ? ((valor - valorAnterior) / valorAnterior) * 100 : null;

    const content = (
        <div
            className="flex items-center justify-between py-2 px-3.5 transition-colors cursor-pointer"
            style={{ borderBottom: '1px solid var(--border-subtle)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
            <span className="text-xs font-medium"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                {titulo}
            </span>

            <div className="flex items-center gap-2">
                {diff !== null && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded tabular-nums"
                          style={{ background: diffBg, color: diffColor, fontFamily: 'var(--font-mono)' }}>
                        {isPositive ? '+' : ''}{diff.toFixed(2)}%
                    </span>
                )}
                <span className="text-sm font-medium tabular-nums"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {valor ? `$${Number(valor).toLocaleString('es-AR')}` : '—'}
                </span>
            </div>
        </div>
    );

    if (linkTo) return <Link to={linkTo} className="block active:scale-[0.99] transition-transform">{content}</Link>;
    return <div className="active:scale-[0.99] transition-transform">{content}</div>;
}
