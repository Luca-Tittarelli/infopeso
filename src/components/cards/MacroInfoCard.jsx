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
    return <span className="source-badge">{label}</span>;
}

function humanDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

export function MacroCard({ titulo, valor, desc, fecha, id, chart: { duration, type } }) {
    const [difference, setDifference] = useState(0);
    const [chartData, setChartData]   = useState([]);
    const [chartStatus, setChartStatus] = useState('loading');

    const getDates  = chartData.map(item => item?.fecha);
    const getValues = chartData.map(item => item?.valor);

    // Determine chart line color based on trend direction
    const isDark = document.documentElement.classList.contains('dark');
    const chartColor = chartData?.length > 0
        ? chartData[0].valor < valor
            ? (isDark ? '#2ECC71' : '#1A8A4A')
            : chartData[0].valor > valor
                ? (isDark ? '#E74C3C' : '#C0392B')
                : '#9C9890'
        : (isDark ? '#E8942B' : '#C47B2B');

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
                const res   = await fetchData(variableAPI(id, firstDate, today));
                const results = res.data.results?.[0]?.detalle;
                setChartData(results ? results.reverse() : []);
                setChartStatus(res.status);
            }
        };
        fetching();
    }, [id, duration]);

    useEffect(() => {
        const prev = chartData[0]?.valor || 0;
        if (prev !== 0) {
            setDifference(((valor - prev) / prev) * 100);
        } else {
            setDifference(0);
        }
    }, [id, valor, chartData]);

    const isPositive = difference > 0;
    const isNegative = difference < 0;
    const diffColor  = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';
    const diffBg     = isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)';

    return (
        <a href={`/Economia/${id}`} className="block w-full" style={{ textDecoration: 'none' }}>
            <article
                className="w-full p-5 rounded-xl flex flex-col gap-3 transition-all duration-150 cursor-pointer h-full"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.transform  = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow  = '0 4px 16px rgba(0,0,0,0.05)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.transform  = 'translateY(0)';
                    e.currentTarget.style.boxShadow  = 'none';
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold leading-tight"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)' }}>
                        {titulo}
                    </h2>
                    <SourceBadge id={id} />
                </div>

                {/* Chart */}
                <div style={{ height: '110px' }}>
                    {chartStatus === 'loading' && <div className="skeleton w-full h-full rounded-lg" />}
                    {chartStatus === 'error'   && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Sin gráfico</p>
                        </div>
                    )}
                    {chartStatus === 'success' && chartData.length > 0 && (
                        type === 'bars'
                            ? <BarsChart labels={getDates} dataset={getValues} height={110} color={chartColor} duration={duration} />
                            : <LineChart labels={getDates} dataset={getValues} height={110} color={chartColor} duration={duration} />
                    )}
                </div>

                {/* Value + delta */}
                <div className="flex items-end justify-between gap-2">
                    <p className="text-2xl font-medium leading-none"
                       style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                        {typeof valor === 'number' ? valor.toLocaleString('es-AR') : valor}
                    </p>
                    <span className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: diffBg, color: diffColor, fontFamily: 'var(--font-mono)' }}>
                        <DifferenceIcon dif={difference} size={11} />
                        {Math.abs(difference).toFixed(2)}%
                        <span className="ml-0.5 font-normal opacity-70">
                            {duration === 'year' ? 'anual' : 'mensual'}
                        </span>
                    </span>
                </div>

                {/* Desc + date */}
                {desc && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}>
                        {desc.charAt(0).toUpperCase() + desc.slice(1)}
                    </p>
                )}
                <p className="text-xs" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}>
                    {humanDate(fecha)}
                </p>
            </article>
        </a>
    );
}
