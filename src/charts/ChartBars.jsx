import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const BarsChart = ({ labels, dataset, height = 100, color, showAxes = true }) => {
    const resolvedColor = resolveChartTone(color);
    const inkColor = getCssVar('--ink');
    const inkSubtleColor = getCssVar('--ink-subtle');
    const lineGridColor = getCssVar('--line');
    const surfaceBg = getCssVar('--surface-200');

    const data = {
        labels,
        datasets: [
            {
                data: dataset,
                backgroundColor: resolvedColor,
                borderRadius: 4,
                borderSkipped: false,
                hoverBackgroundColor: resolvedColor,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
                beginAtZero: true,
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
                    label: (item) => Number(item.raw).toLocaleString('es-AR'),
                },
            },
            title: { display: false },
        },
    };

    return (
        <div style={{ width: '100%', height: `${height}px` }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarsChart;
