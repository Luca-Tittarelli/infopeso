'use client';

import { useEffect, useState } from 'react';
import LineChart from '../../charts/ChartLine';
import { filtrarUltimaSemana } from '../../utils/functions';
import { formatCurrency, formatUpdatedTime, isValidNumber } from '@/utils/formatters';
import { Delta } from '@/components/pulso/Delta';
import Link from 'next/link';

function PillToggle({ options, selected, onChange }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {options.map((opt) => {
                const active = selected === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className="label"
                        style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-pill)',
                            background: active ? 'var(--surface-200)' : 'transparent',
                            color: active ? 'var(--ink)' : 'var(--ink-subtle)',
                            border: `1px solid ${active ? 'var(--ink-subtle)' : 'var(--line)'}`,
                            cursor: 'pointer',
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

export function ChangesCard({ titulo, compra, venta, cotizaciones, fecha, chart, linkTo }) {
    const [difference, setDifference] = useState(null);
    const [duration, setDuration] = useState('week');
    const [chartData, setChartData] = useState([]);

    const showChart = chart !== false;

    const labels = (arr) => arr.map((item) => item.fecha);
    const values = (arr) => arr.map((item) => item.venta);

    const ventaAnterior =
        cotizaciones?.data?.length > 0
            ? cotizaciones.data[cotizaciones.data.length - 1].venta
            : null;

    useEffect(() => {
        if (!isValidNumber(ventaAnterior) || Number(ventaAnterior) === 0 || !isValidNumber(venta) || Number(venta) === 0) {
            setDifference(null);
            return;
        }
        const diff = ((Number(venta) - Number(ventaAnterior)) / Number(ventaAnterior)) * 100;
        setDifference(diff);
    }, [venta, ventaAnterior]);

    useEffect(() => {
        if (cotizaciones?.data?.length > 0) {
            const filtered =
                duration === 'month'
                    ? cotizaciones.data
                    : filtrarUltimaSemana(cotizaciones.data);
            setChartData(filtered || []);
        } else {
            setChartData([]);
        }
    }, [duration, cotizaciones]);

    const firstVenta = chartData?.length > 0 ? chartData[0].venta : null;
    const isUp = firstVenta !== null && Number(venta) >= Number(firstVenta);

    const getLineColor = () => (isUp ? 'up' : 'down');

    const ventanum = Number(venta);
    const compranum = Number(compra);

    return (
        <article
            style={{
                background: 'var(--surface-100)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                height: '100%',
                transition: 'background-color 150ms ease-out',
            }}
        >
            {/* Fila superior: Etiqueta + Selector 1S/1M */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                <p className="label" style={{ margin: 0, color: 'var(--ink-subtle)' }}>
                    {linkTo ? (
                        <Link href={linkTo} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {titulo} · VENTA
                        </Link>
                    ) : (
                        `${titulo} · VENTA`
                    )}
                </p>
                {showChart && (
                    <PillToggle
                        options={[
                            { label: '1S', value: 'week' },
                            { label: '1M', value: 'month' },
                        ]}
                        selected={duration}
                        onChange={setDuration}
                    />
                )}
            </div>

            {/* Cifra protagonista (Venta) */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <p className="figure" style={{ margin: 0, color: 'var(--ink)' }}>
                    {isValidNumber(ventanum) && ventanum > 0 ? formatCurrency(ventanum, 'ARS') : '—'}
                </p>
                {isValidNumber(compranum) && compranum > 0 && (
                    <span className="data" style={{ color: 'var(--ink-muted)' }}>
                        COMPRA {formatCurrency(compranum, 'ARS')}
                    </span>
                )}
            </div>

            {/* Gráfico de evolución */}
            {showChart && (
                <div style={{ height: '76px', marginBlock: 'var(--space-1)' }}>
                    {chartData.length > 0 ? (
                        <LineChart
                            dataset={values(chartData)}
                            labels={labels(chartData)}
                            height={76}
                            color={getLineColor()}
                            showAxes={false}
                        />
                    ) : (
                        <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                    )}
                </div>
            )}

            {/* Fila inferior: Delta pastilla + Hora de actualización + Acción secundaria */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-2)',
                    marginTop: 'auto',
                    paddingTop: 'var(--space-2)',
                    borderTop: '1px solid var(--line)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    {difference !== null ? <Delta value={difference} unit="%" pill={true} /> : <span />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        {formatUpdatedTime(fecha)}
                    </span>
                    {linkTo && (
                        <Link
                            href={linkTo}
                            className="label"
                            style={{ color: 'var(--signal-text)', textDecoration: 'none' }}
                        >
                            DETALLE →
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
