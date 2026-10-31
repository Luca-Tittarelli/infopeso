'use client';

import { useTheme } from '@/hooks/useTheme';

export function TradingViewContainer({ children, height, minHeight, className = '', style = {} }) {
    const [theme, , mounted] = useTheme();

    return (
        <div
            className={`w-full relative overflow-hidden ${className}`}
            style={{
                height,
                minHeight: minHeight || height,
                background: 'var(--surface-100)',
                ...style,
            }}
        >
            {mounted ? (
                <div key={theme} style={{ width: '100%', height: '100%' }}>
                    {typeof children === 'function' ? children(theme) : children}
                </div>
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        minHeight: minHeight || height || '120px',
                        background: 'var(--surface-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        CARGANDO GRÁFICO…
                    </span>
                </div>
            )}
        </div>
    );
}

export default TradingViewContainer;
