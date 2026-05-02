import { useEffect, useState } from "react";
import { RiesgoPaisHistoricoAPI, variableAPI } from "../../apis";
import { fetchData } from "../../utils/Fetch";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../../charts/ChartLine";
import BarsChart from '../../charts/ChartBars';
import { filtrarUltimoMes, getLastMonthDate, getLastYearDate, getTodayDate } from "../../utils/functions";
import { Loading } from "../LoadingAnim";

function SourceBadge({ id }) {
    const label = (id === 44 || id === 'riesgo-pais') ? 'ArgentinaDatos' : 'BCRA';
    return (
        <span className="source-badge">{label}</span>
    );
}

function humanDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export function MacroCard({ titulo, valor, desc, fecha, id, chart: { duration, type } }) {
    const [difference, setDifference] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [chartDataStatus, setChartDataStatus] = useState('loading');

    const getDates = chartData.map(item => item?.fecha);
    const getValues = chartData.map(item => item?.valor);

    const chartColor = chartData?.length > 0
        ? chartData[0].valor < valor
            ? 'var(--positive)'
            : chartData[0].valor > valor
                ? 'var(--negative)'
                : 'var(--text-tertiary)'
        : 'var(--accent)';

    // Resolved CSS variable to actual hex for Chart.js
    const resolveColor = (cssVar) => {
        const map = {
            'var(--positive)': '#00C853',
            'var(--negative)': '#FF1744',
            'var(--text-tertiary)': '#8B98A5',
            'var(--accent)': '#0066FF',
        };
        return map[cssVar] || '#0066FF';
    };

    useEffect(() => {
        const fetching = async () => {
            let firstDate = getLastMonthDate();
            if (duration === 'year') firstDate = getLastYearDate();

            if (id === 'riesgo-pais') {
                const res = await fetchData(RiesgoPaisHistoricoAPI);
                setChartData(filtrarUltimoMes(res.data).reverse());
                setChartDataStatus(res.status);
            } else {
                const today = getTodayDate();
                const res = await fetchData(variableAPI(id, firstDate, today));
                const apiResults = res.data.results?.length > 0
                    ? res.data.results[0].detalle
                    : null;
                setChartData(apiResults ? apiResults.reverse() : []);
                setChartDataStatus(res.status);
            }
        };
        fetching();
    }, [id, duration]);

    useEffect(() => {
        const previousValue = chartData[0]?.valor || 0;
        if (previousValue !== 0) {
            const diffPercentage = ((valor - previousValue) / previousValue) * 100;
            setDifference(diffPercentage.toFixed(2));
        } else {
            setDifference(0);
        }
    }, [id, valor, chartData]);

    const isPositive = difference > 0;
    const isNegative = difference < 0;
    const diffColor = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';

    const resolvedChartColor = resolveColor(chartColor);

    return (
        <a
            href={`/Economia/${id}`}
            className="block w-full"
            style={{ textDecoration: 'none' }}
        >
            <article
                className="w-full p-5 rounded-[12px] flex flex-col gap-3 transition-all duration-150 cursor-pointer"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    height: '100%',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h2
                        className="text-sm font-semibold leading-tight"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'General Sans, system-ui' }}
                    >
                        {titulo}
                    </h2>
                    <SourceBadge id={id} />
                </div>

                {/* Chart area */}
                <div style={{ height: '110px' }}>
                    {chartDataStatus === 'loading' && (
                        <div className="skeleton w-full h-full rounded-lg" />
                    )}
                    {chartDataStatus === 'error' && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin gráfico</p>
                        </div>
                    )}
                    {chartDataStatus === 'success' && chartData.length > 0 && (
                        type === 'bars' ? (
                            <BarsChart
                                labels={getDates}
                                dataset={getValues}
                                height={110}
                                color={resolvedChartColor}
                                duration={duration}
                            />
                        ) : (
                            <LineChart
                                labels={getDates}
                                dataset={getValues}
                                height={110}
                                color={resolvedChartColor}
                                duration={duration}
                            />
                        )
                    )}
                </div>

                {/* Value + variation */}
                <div className="flex items-end justify-between gap-2">
                    <p
                        className="text-2xl font-bold leading-none tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        {typeof valor === 'number' ? valor.toLocaleString('es-AR') : valor}
                    </p>
                    <span
                        className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{
                            background: isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)',
                            color: diffColor,
                        }}
                    >
                        <DifferenceIcon dif={difference} size={12} />
                        {Math.abs(difference)}%
                        <span className="ml-0.5 font-normal opacity-70">
                            {duration === 'year' ? 'anual' : 'mensual'}
                        </span>
                    </span>
                </div>

                {/* Desc + date */}
                {desc && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {desc.charAt(0).toUpperCase() + desc.slice(1)}
                    </p>
                )}

                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {humanDate(fecha)}
                </p>
            </article>
        </a>
    );
}
