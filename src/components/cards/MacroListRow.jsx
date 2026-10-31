'use client';

import { useEffect, useState } from 'react';
import { RiesgoPaisHistoricoAPI, variableAPI } from '../../apis';
import { fetchData } from '../../utils/Fetch';
import LineChart from '../../charts/ChartLine';
import BarsChart from '../../charts/ChartBars';
import { filtrarUltimoMes, getLastMonthDate, getLastYearDate, getTodayDate } from '../../utils/functions';
import { Delta } from '@/components/pulso/Delta';
import { formatNumber, formatUpdatedTime, isValidNumber } from '@/utils/formatters';
import Link from 'next/link';

export function MacroListRow({ titulo, valor, desc, fecha, id, chart: { duration, type }, historyData = null, rawDiff = null }) {
    const [difference, setDifference] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartStatus, setChartStatus] = useState('loading');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (historyData) {
            setChartData(historyData);
            setDifference(rawDiff ?? null);
            setChartStatus('success');
            return;
        }

        const fetching = async () => {
            let firstDate = getLastMonthDate();
            if (duration === 'year') firstDate = getLastYearDate();

            if (id === 'riesgo-pais') {
                const res = await fetchData(RiesgoPaisHistoricoAPI);
                setChartData(filtrarUltimoMes(res.data).reverse());
                setChartStatus(res.status);
            } else {
                const today = getTodayDate();
                const res = await fetchData(variableAPI(id, firstDate, today));
                const results = res.data.results?.[0]?.detalle;
                setChartData(results ? results.reverse() : []);
                setChartStatus(res.status);
            }
        };
        fetching();
    }, [id, duration, historyData, rawDiff]);

    useEffect(() => {
        if (historyData) return;
        const prev = chartData[0]?.valor || 0;
        if (prev !== 0 && isValidNumber(valor)) {
            setDifference(((Number(valor) - Number(prev)) / Math.abs(Number(prev))) * 100);
        } else {
            setDifference(null);
        }
    }, [id, valor, chartData, historyData]);

    const getDates = chartData.map((item) => item?.fecha);
    const getValues = chartData.map((item) => item?.valor);

    const isUp = (difference || 0) >= 0;
    const getLineColor = () => (isUp ? 'up' : 'down');

    const sourceLabel = historyData ? 'BANCO MUNDIAL' : id === 44 || id === 'riesgo-pais' ? 'ARGENTINADATOS' : 'BCRA';

    return (
        <article
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                background: isExpanded ? 'var(--surface-200)' : 'var(--surface-100)',
                borderBottom: '1px solid var(--line)',
                padding: 'var(--space-4) var(--space-6)',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-out',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface-200)';
            }}
            onMouseLeave={(e) => {
                if (!isExpanded) e.currentTarget.style.background = 'var(--surface-100)';
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '15px',
                                lineHeight: 1.2,
                                color: 'var(--ink)',
                            }}
                        >
                            {titulo}
                        </h2>
                        <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                            · {sourceLabel}
                        </span>
                    </div>
                    {desc && (
                        <p
                            style={{
                                margin: '2px 0 0 0',
                                fontFamily: 'var(--font-display)',
                                fontSize: '12px',
                                color: 'var(--ink-subtle)',
                            }}
                        >
                            {desc.charAt(0).toUpperCase() + desc.slice(1)}
                        </p>
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-6)',
                        marginLeft: 'auto',
                    }}
                >
                    <Delta value={difference} unit="%" compact={true} pill={false} />

                    <div style={{ textAlign: 'right' }}>
                        <p className="data" style={{ margin: 0, fontWeight: 500, color: 'var(--ink)', fontSize: '16px' }}>
                            {typeof valor === 'number' ? formatNumber(valor) : valor || '—'}
                        </p>
                        <p className="label" style={{ margin: '2px 0 0 0', color: 'var(--ink-subtle)', fontSize: '11px' }}>
                            {formatUpdatedTime(fecha)}
                        </p>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div
                    style={{
                        marginTop: 'var(--space-4)',
                        paddingTop: 'var(--space-4)',
                        borderTop: '1px solid var(--line)',
                    }}
                >
                    <div style={{ height: '220px', width: '100%' }}>
                        {chartStatus === 'loading' && <div className="skeleton" style={{ width: '100%', height: '100%' }} />}
                        {chartStatus === 'success' && chartData.length > 0 && (
                            type === 'bars' ? (
                                <BarsChart labels={getDates} dataset={getValues} height={220} color={getLineColor()} showAxes={true} />
                            ) : (
                                <LineChart labels={getDates} dataset={getValues} height={220} color={getLineColor()} showAxes={true} />
                            )
                        )}
                    </div>

                    {!historyData && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                            <Link
                                href={`/Economia/${id}`}
                                className="pulso-btn pulso-btn-secondary pulso-btn-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Ver serie histórica →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
