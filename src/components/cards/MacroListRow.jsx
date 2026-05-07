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
    return <span className="source-badge" style={{ fontSize: '9px', padding: '1px 4px' }}>{label}</span>;
}

function humanDate(dateStr) {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

export function MacroListRow({ titulo, valor, desc, fecha, id, chart: { duration, type }, historyData = null, rawDiff = null }) {
    const [difference, setDifference] = useState(0);
    const [chartData, setChartData]   = useState([]);
    const [chartStatus, setChartStatus] = useState('loading');
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine chart line color based on trend direction
    const isDark = document.documentElement.classList.contains('dark');
    
    useEffect(() => {
        // Si nos pasan los datos pre-cargados (ej: PBI), los usamos directamente
        if (historyData) {
            setChartData(historyData);
            setDifference(rawDiff || 0);
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
                const res   = await fetchData(variableAPI(id, firstDate, today));
                const results = res.data.results?.[0]?.detalle;
                setChartData(results ? results.reverse() : []);
                setChartStatus(res.status);
            }
        };
        fetching();
    }, [id, duration, historyData, rawDiff]);

    useEffect(() => {
        if (historyData) return; // Si hay data pre-cargada, ya seteamos la diff arriba
        const prev = chartData[0]?.valor || 0;
        if (prev !== 0) {
            setDifference(((valor - prev) / prev) * 100);
        } else {
            setDifference(0);
        }
    }, [id, valor, chartData, historyData]);

    const getDates  = chartData.map(item => item?.fecha);
    const getValues = chartData.map(item => item?.valor);

    // Calcular un valor numérico "limpio" para comparar tendencias, ya que `valor` puede ser string en PBI
    const currentVal = historyData ? chartData[chartData.length - 1]?.valor : valor;
    
    const chartColor = chartData?.length > 0
        ? chartData[0].valor < currentVal
            ? (isDark ? '#2ECC71' : '#1A8A4A')
            : chartData[0].valor > currentVal
                ? (isDark ? '#E74C3C' : '#C0392B')
                : '#9C9890'
        : (isDark ? '#E8942B' : '#C47B2B');

    const isPositive = difference > 0;
    const isNegative = difference < 0;
    const diffColor  = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';
    const diffBg     = isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)';

    const showSourceBadge = !historyData; // Ocultar badge de fuente para PBI por ahora

    return (
        <div className="w-full">
            <article
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 rounded-lg flex flex-col gap-4 transition-all duration-150 cursor-pointer"
                style={{ 
                    background: isExpanded ? 'var(--bg-surface-hover)' : 'var(--bg-surface)', 
                    borderBottom: isExpanded ? 'none' : '1px solid var(--border-subtle)',
                    border: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={e => {
                    if (!isExpanded) e.currentTarget.style.background = 'var(--bg-surface)';
                }}
            >
                {/* Cabecera (Siempre visible) */}
                <div className="flex items-center justify-between gap-4">
                {/* Izquierda: Info Principal */}
                <div className="flex flex-col min-w-0" style={{ flex: '1 1 40%' }}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-sm font-medium truncate"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>
                            {titulo}
                        </h2>
                        {showSourceBadge && <SourceBadge id={id} />}
                    </div>
                    {desc && (
                        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-ui)' }}>
                            {desc.charAt(0).toUpperCase() + desc.slice(1)}
                        </p>
                    )}
                </div>

                {/* Medio: Valor y Delta */}
                <div className="flex flex-col items-end" style={{ flex: '1 1 25%' }}>
                    <p className="text-[15px] font-semibold leading-tight"
                       style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                        {typeof valor === 'number' ? valor.toLocaleString('es-AR') : valor}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1 rounded"
                              style={{ background: diffBg, color: diffColor, fontFamily: 'var(--font-mono)' }}>
                            <DifferenceIcon dif={difference} size={9} />
                            {Math.abs(difference).toFixed(2)}%
                        </span>
                        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                            {humanDate(fecha)}
                        </p>
                    </div>
                </div>

                </div>

                {/* Contenido Expandido (Gráfico Completo) */}
                {isExpanded && (
                    <div className="w-full pt-2 animate-fade-in border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div style={{ height: '240px', width: '100%', marginTop: '10px' }}>
                            {chartStatus === 'loading' && <div className="skeleton w-full h-full rounded" />}
                            {chartStatus === 'success' && chartData.length > 0 && (
                                type === 'bars'
                                    ? <BarsChart labels={getDates} dataset={getValues} height={240} color={chartColor} duration={duration} showAxes={true} />
                                    : <LineChart labels={getDates} dataset={getValues} height={240} color={chartColor} duration={duration} showAxes={true} />
                            )}
                        </div>
                        
                        {!historyData && (
                            <div className="flex justify-end mt-4">
                                <a 
                                    href={`/Economia/${id}`} 
                                    className="text-xs font-medium hover:underline" 
                                    style={{ color: 'var(--accent)' }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Ver detalles completos &rarr;
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </article>
        </div>
    );
}
