'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Delta } from './Delta';
import { isValidNumber, formatNumber, formatUpdatedTime } from '@/utils/formatters';

export function QuoteCard({
    label,
    value,
    prefix = '',
    suffix = '',
    decimals = 2,
    delta = null,
    deltaUnit = '%',
    deltaDecimals = 2,
    deltaSuffix = '',
    updatedAt = '',
    delayed = false,
    secondaryLabel = '',
    secondaryValue = '',
    href = '',
    featured = false,
    loading = false,
    children,
}) {
    const [flashing, setFlashing] = useState(false);
    const prevValueRef = useRef(value);

    useEffect(() => {
        if (prevValueRef.current !== undefined && prevValueRef.current !== null && value !== prevValueRef.current) {
            setFlashing(true);
            const timer = setTimeout(() => setFlashing(false), 600);
            prevValueRef.current = value;
            return () => clearTimeout(timer);
        }
        prevValueRef.current = value;
    }, [value]);

    const hasValue = isValidNumber(value) && Number(value) !== 0;
    const formattedNum = hasValue
        ? formatNumber(value, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : typeof value === 'string' && value.trim() !== '' && value !== '0'
        ? value
        : null;

    const displayPrefix = formattedNum && prefix ? `${prefix.trim()} ` : '';
    const timeText = typeof updatedAt === 'string' && updatedAt.startsWith('ACTUALIZADO')
        ? updatedAt
        : formatUpdatedTime(updatedAt, { delayed });

    const cardContent = (
        <article
            className={flashing && !featured ? 'live-flash' : ''}
            style={{
                background: featured ? 'var(--signal)' : 'var(--surface-100)',
                color: featured ? 'var(--on-signal)' : 'var(--ink)',
                border: `1px solid ${featured ? 'var(--signal)' : 'var(--line)'}`,
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                height: '100%',
                transition: 'background-color 150ms ease-out, border-color 150ms ease-out',
            }}
        >
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div className="skeleton" style={{ height: '14px', width: '55%' }} />
                    <div className="skeleton" style={{ height: '40px', width: '75%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="skeleton" style={{ height: '26px', width: '80px', borderRadius: 'var(--radius-pill)' }} />
                        <div className="skeleton" style={{ height: '12px', width: '70px' }} />
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                            <p
                                className="label"
                                style={{
                                    margin: 0,
                                    color: featured ? 'var(--on-signal)' : 'var(--ink-subtle)',
                                }}
                            >
                                {label}
                            </p>
                            {secondaryLabel && (
                                <span
                                    className="label"
                                    style={{
                                        color: featured ? 'var(--on-signal)' : 'var(--ink-muted)',
                                    }}
                                >
                                    {secondaryLabel}{secondaryValue ? ` ${secondaryValue}` : ''}
                                </span>
                            )}
                        </div>

                        <p
                            className="figure"
                            style={{
                                margin: 0,
                                color: featured ? 'var(--on-signal)' : 'var(--ink)',
                            }}
                        >
                            {formattedNum ? (
                                <>
                                    {displayPrefix}
                                    {formattedNum}
                                    {suffix && (
                                        <span
                                            style={{
                                                fontSize: '20px',
                                                fontWeight: 600,
                                                color: featured ? 'var(--on-signal)' : 'var(--ink-muted)',
                                                marginLeft: 'var(--space-1)',
                                            }}
                                        >
                                            {suffix}
                                        </span>
                                    )}
                                </>
                            ) : (
                                '—'
                            )}
                        </p>
                    </div>

                    {children && <div style={{ marginTop: 'var(--space-1)' }}>{children}</div>}

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            marginTop: 'auto',
                        }}
                    >
                        {formattedNum && isValidNumber(delta) ? (
                            <Delta
                                value={delta}
                                unit={deltaUnit}
                                decimals={deltaDecimals}
                                suffix={deltaSuffix}
                                pill={true}
                                onSignal={featured}
                            />
                        ) : (
                            <span />
                        )}
                        <span
                            className="label"
                            style={{
                                color: featured ? 'var(--on-signal)' : 'var(--ink-subtle)',
                                fontSize: '12px',
                                fontWeight: 400,
                            }}
                        >
                            {timeText}
                        </span>
                    </div>
                </>
            )}
        </article>
    );

    if (href) {
        return (
            <Link
                href={href}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
            >
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}

export default QuoteCard;
