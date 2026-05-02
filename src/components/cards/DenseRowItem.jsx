import { Link } from "react-router-dom";

export function DenseRowItem({ titulo, valor, valorAnterior, label = "ARS/USD", linkTo }) {
    const isPositive = valor && valorAnterior && valor > valorAnterior;
    const isNegative = valor && valorAnterior && valor < valorAnterior;
    const diffColor = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';
    const diff = valor && valorAnterior ? ((valor - valorAnterior) / valorAnterior) * 100 : null;

    const content = (
        <div 
            className="flex items-center justify-between py-3 px-4 transition-colors"
            style={{ 
                borderBottom: '1px solid var(--border-subtle)',
                background: 'transparent'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
            <div className="flex flex-col">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{titulo}</span>
                <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
                <span 
                    className="text-base font-bold tabular-nums" 
                    style={{ fontFamily: 'Satoshi, system-ui', color: 'var(--text-primary)' }}
                >
                    {valor ? `$${Number(valor).toLocaleString('es-AR')}` : '—'}
                </span>
                {diff !== null && (
                    <span 
                        className="text-[10px] font-semibold px-1.5 py-[2px] rounded-sm tabular-nums"
                        style={{
                            background: isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)',
                            color: diffColor,
                        }}
                    >
                        {isPositive ? '+' : ''}{diff.toFixed(2)}%
                    </span>
                )}
            </div>
        </div>
    );

    if (linkTo) {
        return <Link to={linkTo} className="block active:scale-[0.99] transition-transform">{content}</Link>;
    }
    return <div className="active:scale-[0.99] transition-transform">{content}</div>;
}
