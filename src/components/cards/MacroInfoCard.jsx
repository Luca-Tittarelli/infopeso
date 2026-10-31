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

export function MacroCard({ titulo, valor, desc, fecha, id, chart: { duration, type } }) {
    const [difference, setDifference] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [chartStatus, setChartStatus] = useState('loading');

    const getDates = chartData.map((item) => item?.fecha);
    const getValues = chartData.map((item) => item?.valor);

    useEffect(() => {
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
    }, [id, duration]);

    useEffect(() => {
        const prev = chartData[0]?.valor || 0;
        if (prev !== 0 && isValidNumber(valor)) {
            setDifference(((Number(valor) - Number(prev)) / Math.abs(Number(prev))) * 100);
        } else {
            setDifference(null);
        }
    }, [id, valor, chartData]);

    const sourceLabel = id === 44 || id === 'riesgo-pais' ? 'ARGENTINADATOS' : 'BCRA';
    const isUp = (difference || 0) >= 0;
    const getLineColor = () => (isUp ? 'up' : 'down');

    return (
        <Link href={`/Economia/${id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', height: '100%' }}>
            <article
                className="pulso-card"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    height: '100%',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                    <h2 className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>
                        {titulo} · {sourceLabel}
                    </h2>
                </div>

                <p className="figure" style={{ margin: 0, color: 'var(--ink)' }}>
                    {isValidNumber(valor) ? formatNumber(valor) : valor || '—'}
                </p>

                <div style={{ height: '96px' }}>
                    {chartStatus === 'loading' && <div className="skeleton" style={{ width: '100%', height: '100%' }} />}
                    {chartStatus === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <p className="label" style={{ color: 'var(--ink-subtle)', margin: 0 }}>—</p>
                        </div>
                    )}
                    {chartStatus === 'success' && chartData.length > 0 && (
                        type === 'bars' ? (
                            <BarsChart labels={getDates} dataset={getValues} height={96} color={getLineColor()} showAxes={false} />
                        ) : (
                            <LineChart labels={getDates} dataset={getValues} height={96} color={getLineColor()} showAxes={false} />
                        )
                    )}
                </div>

                {desc && (
                    <p className="body-sm" style={{ color: 'var(--ink-muted)', margin: 0 }}>
                        {desc.charAt(0).toUpperCase() + desc.slice(1)}
                    </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', marginTop: 'auto' }}>
                    <Delta value={difference} unit="%" pill={true} />
                    <span className="label" style={{ color: 'var(--ink-subtle)' }}>
                        {formatUpdatedTime(fecha)}
                    </span>
                </div>
            </article>
        </Link>
    );
}
