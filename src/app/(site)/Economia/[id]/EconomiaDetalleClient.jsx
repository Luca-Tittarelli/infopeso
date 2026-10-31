'use client';

import { useEffect, useState, useMemo } from "react";
import { fetchData } from "@/utils/Fetch";
import { RiesgoPaisHistoricoAPI, variableAPI } from "@/apis";
import { Loading } from "@/components/LoadingAnim";
import { getTodayDate } from "@/utils/functions";
import LineChart from "@/charts/ChartLine";
import { Delta } from "@/components/pulso/Delta";
import { formatNumber } from "@/utils/formatters";

const PERIODS = [
    { label: '7D', value: '7D' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '6M', value: '6M' },
    { label: '1A', value: '1Y' },
    { label: '3A', value: '3Y' },
    { label: '5A', value: '5Y' },
];

export default function EconomiaDetalleClient({ id, meta = null, initialData = null }) {
    const [fullChartData, setFullChartData] = useState(initialData || []);
    const [chartDataStatus, setChartDataStatus] = useState(initialData ? 'success' : 'loading');
    const [selected, setSelected] = useState('1M');

    const getLabels = data => data.map(d => d.fecha);
    const getValues = data => data.map(d => d.valor);

    useEffect(() => {
        const fetching = async () => {
            if (!initialData) setChartDataStatus('loading');
            try {
                if (id === 'riesgo-pais') {
                    const res = await fetchData(RiesgoPaisHistoricoAPI);
                    setFullChartData(res.data || []);
                    setChartDataStatus(res.status);
                } else {
                    const today = new Date();
                    const pastDate = new Date(today.setFullYear(today.getFullYear() - 5));
                    const fiveYearsAgo = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;
                    const res = await fetchData(variableAPI(id, fiveYearsAgo, getTodayDate()));
                    const apiResults = res.data.results?.length > 0 ? res.data.results[0].detalle : [];
                    setFullChartData(apiResults.reverse());
                    setChartDataStatus(res.status);
                }
            } catch (err) {
                console.error("Error fetching historical detail data:", err);
                setChartDataStatus('error');
            }
        };
        fetching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const chartData = useMemo(() => {
        if (!fullChartData || fullChartData.length === 0) return [];
        const today = new Date();
        const pastDate = new Date(today);
        if (selected === '7D') pastDate.setDate(today.getDate() - 7);
        if (selected === '1M') pastDate.setMonth(today.getMonth() - 1);
        if (selected === '3M') pastDate.setMonth(today.getMonth() - 3);
        if (selected === '6M') pastDate.setMonth(today.getMonth() - 6);
        if (selected === '1Y') pastDate.setFullYear(today.getFullYear() - 1);
        if (selected === '3Y') pastDate.setFullYear(today.getFullYear() - 3);
        if (selected === '5Y') pastDate.setFullYear(today.getFullYear() - 5);
        return fullChartData.filter(d => new Date(d.fecha) >= pastDate);
    }, [fullChartData, selected]);

    const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].valor : null;
    const initialValue = chartData.length > 0 ? chartData[0].valor : 0;
    const difference = initialValue !== 0 && latestValue !== null
        ? (((latestValue - initialValue) / initialValue) * 100)
        : 0;

    const chartTone = difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral';

    const displayTitle = meta?.title ? meta.title.split('—')[0].trim() : '—';
    const displaySubtitle = meta?.dataset?.variableMeasured || meta?.description || null;
    const latestDate = fullChartData.length > 0 ? fullChartData[fullChartData.length - 1].fecha : '—';

    if (chartDataStatus === 'loading') {
        return <Loading />;
    }

    return (
        <div className="space-y-6">
            {/* Hero card */}
            <div className="pulso-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <p className="label" style={{ color: 'var(--signal-text)', margin: '0 0 var(--space-1) 0' }}>
                            INDICADOR MACROECONÓMICO · {id === 'riesgo-pais' ? 'ARGENTINADATOS' : 'BCRA'}
                        </p>
                        <h1 className="h1" style={{ color: 'var(--ink)', margin: 0 }}>
                            {displayTitle}
                        </h1>
                        {displaySubtitle && (
                            <p className="body-sm" style={{ color: 'var(--ink-muted)', marginTop: 'var(--space-1)', marginBottom: 0 }}>
                                {displaySubtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2">
                        <p className="figure" style={{ color: 'var(--ink)', margin: 0 }}>
                            {latestValue !== null ? formatNumber(latestValue, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '—'}
                            {id === 'riesgo-pais' && latestValue !== null ? (
                                <span style={{ color: 'var(--ink-muted)', fontSize: '0.68em', fontWeight: 500, marginLeft: '0.2em' }}>pb</span>
                            ) : null}
                        </p>
                        <div className="flex items-center gap-2">
                            <Delta value={difference} pill={true} />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--ink-subtle)' }}>
                                {PERIODS.find(p => p.value === selected)?.label}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Period selector */}
            <div className="flex items-center gap-2 flex-wrap">
                {PERIODS.map(period => (
                    <button
                        key={period.value}
                        type="button"
                        onClick={() => setSelected(period.value)}
                        className={selected === period.value ? 'pill-active' : 'pill-inactive'}
                        style={{ cursor: 'pointer' }}
                    >
                        {period.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="pulso-card">
                {chartData.length === 0 ? (
                    <p className="body-sm text-center py-16" style={{ color: 'var(--ink-subtle)' }}>
                        Sin datos disponibles para este período.
                    </p>
                ) : (
                    <LineChart
                        labels={getLabels(chartData)}
                        dataset={getValues(chartData)}
                        height={320}
                        color={chartTone}
                    />
                )}
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between px-1">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                    ACTUALIZADO {latestDate}
                </p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-caption)', color: 'var(--ink-subtle)', margin: 0 }}>
                    Fuente: {id === 'riesgo-pais' ? 'ArgentinaDatos API' : 'BCRA'}
                </p>
            </div>
        </div>
    );
}
