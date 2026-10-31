import { isValidNumber, formatDeltaText, formatDeltaAriaLabel } from '@/utils/formatters';

export function Delta({
    value,
    unit = '%',
    decimals = 2,
    pill = false,
    compact = false,
    onSignal = false,
    suffix = '',
    className = '',
}) {
    if (!isValidNumber(value)) {
        return (
            <span
                className={className}
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: onSignal ? 'var(--on-signal)' : 'var(--ink-subtle)',
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                —
            </span>
        );
    }

    const n = Number(value);
    const isUp = n > 0;
    const isDown = n < 0;
    const text = formatDeltaText(n, { unit, decimals }) + (suffix ? ` ${suffix}` : '');
    const ariaLabel = formatDeltaAriaLabel(n, { unit, decimals });

    const textColor = onSignal
        ? 'var(--on-signal)'
        : isUp
        ? 'var(--signal-text)'
        : isDown
        ? 'var(--down)'
        : 'var(--ink-subtle)';

    const iconFill = onSignal
        ? 'var(--on-signal)'
        : isUp
        ? 'var(--up)'
        : 'var(--down)';

    const triW = compact ? 9 : 10;
    const triH = compact ? 8 : 9;

    return (
        <span
            className={className}
            aria-label={ariaLabel}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                lineHeight: 1,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                color: textColor,
                ...(pill
                    ? {
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-pill)',
                          background: onSignal ? 'rgba(20, 18, 16, 0.14)' : 'var(--surface-200)',
                      }
                    : {}),
            }}
        >
            {isUp && (
                <svg
                    width={triW}
                    height={triH}
                    viewBox="0 0 10 9"
                    aria-hidden="true"
                    style={{ flex: 'none', fill: iconFill }}
                >
                    <polygon points="5,0 10,9 0,9" />
                </svg>
            )}
            {isDown && (
                <svg
                    width={triW}
                    height={triH}
                    viewBox="0 0 10 9"
                    aria-hidden="true"
                    style={{ flex: 'none', fill: iconFill }}
                >
                    <polygon points="0,0 10,0 5,9" />
                </svg>
            )}
            <span>{text}</span>
        </span>
    );
}

export default Delta;
