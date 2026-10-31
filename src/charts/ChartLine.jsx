import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function getCssVar(name) {
    if (typeof window === 'undefined') return '';
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function resolveChartTone(colorProp) {
    if (!colorProp || colorProp === 'signal') return getCssVar('--signal');
    if (colorProp === 'up') return getCssVar('--up');
    if (colorProp === 'down') return getCssVar('--down');
    if (colorProp === 'neutral') return getCssVar('--ink-subtle');
    return colorProp;
}

const LineChart = ({ labels, dataset, height = 100, color, showAxes = true }) => {
    const resolvedLineColor = resolveChartTone(color);
    const inkColor = getCssVar('--ink');
    const inkSubtleColor = getCssVar('--ink-subtle');
    const lineGridColor = getCssVar('--line');
    const surfaceBg = getCssVar('--surface-200');

    // Sin degradés (regla 4 del manual de marca: Sin ruido)
    const data = {
        labels,
        datasets: [
            {
                data: dataset,
                borderColor: resolvedLineColor,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: resolvedLineColor,
                pointHoverBorderColor: inkColor,
                pointHoverBorderWidth: 2,
                fill: false,
                tension: 0.2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                display: showAxes,
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: inkSubtleColor,
                    font: { size: 11, family: '"Geist Mono", monospace' },
                    maxTicksLimit: 6,
                    maxRotation: 0,
                    autoSkip: true,
                },
            },
            y: {
                display: showAxes,
                position: 'right',
                beginAtZero: false,
                grid: {
                    display: showAxes,
                    color: lineGridColor,
                    drawBorder: false,
                },
                border: { display: false },
                ticks: {
                    maxTicksLimit: 5,
                    color: inkSubtleColor,
                    font: { size: 11, family: '"Geist Mono", monospace' },
                    padding: 8,
                    callback: (value) => {
                        if (Math.abs(value) >= 1_000_000)
                            return (value / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 }) + ' M';
                        if (Math.abs(value) >= 1_000)
                            return (value / 1_000).toLocaleString('es-AR', { maximumFractionDigits: 0 }) + ' mil';
                        return Number(value).toLocaleString('es-AR');
                    },
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: surfaceBg,
                titleColor: inkSubtleColor,
                bodyColor: inkColor,
                borderColor: lineGridColor,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                titleFont: { size: 11, family: '"Geist Mono", monospace', weight: '500' },
                bodyFont: { size: 13, family: '"Geist Mono", monospace', weight: '500' },
                callbacks: {
                    title: (items) => items[0]?.label || '',
                    label: (item) => {
                        const val = Number(item.raw);
                        if (!Number.isFinite(val)) return '—';
                        return val.toLocaleString('es-AR', { maximumFractionDigits: 2 });
                    },
                },
            },
            title: { display: false },
        },
    };

    return (
        <div style={{ width: '100%', height: `${height}px` }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;
