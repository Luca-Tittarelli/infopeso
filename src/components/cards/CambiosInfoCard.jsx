import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../../charts/ChartLine";
import { filtrarUltimaSemana, getTimeDifference } from "../../utils/functions";

function PillToggle({ options, selected, onChange }) {
    return (
        <div
            className="flex items-center gap-1 p-0.5 rounded-full"
            style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)' }}
        >
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={selected === opt.value ? 'pill-active' : 'pill-inactive'}
                    style={{ padding: '3px 10px', fontSize: '11px' }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

export function ChangesCard({ titulo, compra, venta, cotizaciones, fecha, chart }) {
    const [difference, setDifference] = useState(0);
    const [duration, setDuration] = useState("week");
    const [chartData, setChartData] = useState([]);
    const [chartColor, setChartColor] = useState('#0066FF');

    const showChart = chart !== false;

    const labels = (arr) => arr.map(item => item.fecha);
    const values = (arr) => arr.map(item => item.venta);

    const ventaAnterior = cotizaciones?.data?.length > 0
        ? cotizaciones.data[cotizaciones.data.length - 1].venta
        : 0;

    useEffect(() => {
        if (ventaAnterior === 0 || venta === 0) return;
        const diff = ((venta - ventaAnterior) / ventaAnterior) * 100;
        setDifference(diff.toFixed(2));
    }, [venta, ventaAnterior]);

    useEffect(() => {
        if (cotizaciones?.data?.length > 0) {
            const filtered = duration === 'month'
                ? cotizaciones.data
                : filtrarUltimaSemana(cotizaciones.data);
            setChartData(filtered || []);
        } else {
            setChartData([]);
        }
    }, [duration, cotizaciones]);

    useEffect(() => {
        if (chartData?.length > 0) {
            const firstVenta = chartData[0].venta;
            setChartColor(
                firstVenta < venta ? '#00C853'
                    : firstVenta > venta ? '#FF1744'
                        : '#8B98A5'
            );
        }
    }, [chartData, venta]);

    const isPositive = difference > 0;
    const isNegative = difference < 0;
    const diffColor = isPositive ? 'var(--positive)' : isNegative ? 'var(--negative)' : 'var(--text-tertiary)';

    return (
        <article
            className="w-full p-5 rounded-[12px] flex flex-col gap-3 transition-all duration-150"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <h3
                    className="text-sm font-semibold truncate"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'General Sans, system-ui' }}
                >
                    {titulo}
                </h3>
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

            {/* Chart */}
            {showChart && (
                <div style={{ height: '80px' }}>
                    {chartData.length > 0 ? (
                        <LineChart
                            dataset={values(chartData)}
                            labels={labels(chartData)}
                            height={80}
                            color={chartColor}
                            duration={duration}
                        />
                    ) : (
                        <div className="skeleton w-full h-full rounded-lg" />
                    )}
                </div>
            )}

            {/* Buy/Sell + diff */}
            <div className="flex items-center justify-between gap-3">
                <div className="text-center">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Compra</p>
                    <p
                        className="text-lg font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        ${compra}
                    </p>
                </div>

                {cotizaciones && (
                    <span
                        className="flex flex-col items-center gap-0.5"
                    >
                        <span
                            className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full"
                            style={{
                                background: isPositive ? 'var(--positive-soft)' : isNegative ? 'var(--negative-soft)' : 'var(--bg-surface-hover)',
                                color: diffColor,
                            }}
                        >
                            <DifferenceIcon dif={difference} size={12} />
                            {Math.abs(difference)}%
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>hoy</span>
                    </span>
                )}

                <div className="text-center">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Venta</p>
                    <p
                        className="text-lg font-bold tracking-tight"
                        style={{ color: 'var(--text-primary)', fontFamily: 'Satoshi, system-ui' }}
                    >
                        ${venta}
                    </p>
                </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {getTimeDifference(fecha)}
            </p>
        </article>
    );
}
