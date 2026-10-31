/**
 * DifferenceIcon — Triángulo de variación de Infopeso Pulso
 * Suba: ▲ en var(--up)
 * Baja: ▼ en var(--down)
 * Sin cambio: = en var(--ink-subtle)
 */
export default function DifferenceIcon({ dif, size = 10 }) {
    const n = Number(dif);
    if (!Number.isFinite(n) || n === 0) {
        return null;
    }
    const h = Math.round((size * 9) / 10);
    if (n < 0) {
        return (
            <svg width={size} height={h} viewBox="0 0 10 9" aria-hidden="true" style={{ flex: 'none', fill: 'var(--down)' }}>
                <polygon points="0,0 10,0 5,9" />
            </svg>
        );
    }
    return (
        <svg width={size} height={h} viewBox="0 0 10 9" aria-hidden="true" style={{ flex: 'none', fill: 'var(--up)' }}>
            <polygon points="5,0 10,9 0,9" />
        </svg>
    );
}
