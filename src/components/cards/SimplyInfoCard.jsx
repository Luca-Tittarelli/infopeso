import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import { getTimeDifference } from "../../utils/functions";
import LineChart from "../../charts/ChartLine";

// Mini sparkline — inline tiny chart with no axes, no interactivity
function MiniSparkline({ values, color }) {
    if (!values || values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const w = 80, h = 32, pad = 2;
    const pts = values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return `${x},${y}`;
    });
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline
                points={pts.join(' ')}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

export function SimplyCard({ titulo, valor = 0, valorAnterior = 0, fecha, isMonthly, sparkValues }) {
    const [difference, setDifference] = useState(0);

    useEffect(() => {
        if (valorAnterior !== 0 && valor) {
            setDifference(((valor - valorAnterior) / valorAnterior) * 100);
        } else {
            setDifference(0);
        }
    }, [valorAnterior, valor]);

    const isPositive = difference > 0;
    const isNegative = difference < 0;
    const diffColor = isPositive
        ? 'var(--positive)'
        : isNegative
            ? 'var(--negative)'
            : 'var(--text-tertiary)';

    return (
        <article
            className="w-full p-5 rounded-[12px] flex flex-col justify-between gap-3 transition-all duration-150 cursor-default"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
        >
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
                <h2
                    className="text-sm font-semibold leading-tight line-clamp-2"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'General Sans, system-ui' }}
                >
                    {titulo}
                </h2>
                {/* Trend badge */}
                <span
                    className="flex-shrink-0 flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                        background: isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)',
                        color: diffColor,
                    }}
                >
                    <DifferenceIcon dif={difference} size={12} />
                    {Math.abs(difference).toFixed(2)}%
                </span>
            </div>

            {/* Value */}
            <div>
                <p
                    className="text-2xl font-bold leading-none tracking-tight"
                    style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                >
                    {typeof valor === 'number' ? valor.toLocaleString('es-AR') : valor}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {getTimeDifference(fecha)}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {isMonthly ? 'Mensual' : 'Hoy'}
                </span>
            </div>
        </article>
    );
}