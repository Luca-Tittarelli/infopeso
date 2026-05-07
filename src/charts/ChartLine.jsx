import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend
);

const LineChart = ({ labels, dataset, height = 100, color = '#0066FF', duration, showAxes = true }) => {
    // Build gradient fill
    const getGradient = (ctx, chartArea) => {
        if (!chartArea) return color + '33';
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, color + '55');
        gradient.addColorStop(0.6, color + '18');
        gradient.addColorStop(1, color + '00');
        return gradient;
    };

    const data = {
        labels,
        datasets: [
            {
                data: dataset,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                fill: true,
                backgroundColor: function (context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return color + '22';
                    return getGradient(ctx, chartArea);
                },
                tension: 0.35,
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
                ticks: {
                    color: '#8B98A5',
                    font: { size: 10, family: 'General Sans' },
                    maxTicksLimit: 6,
                    maxRotation: 0,
                    autoSkip: true,
                }
            },
            y: {
                display: showAxes,
                position: 'right',
                beginAtZero: false,
                grid: { 
                    display: showAxes,
                    color: 'rgba(139, 152, 165, 0.1)',
                    drawBorder: false,
                },
                border: { display: false },
                ticks: {
                    maxTicksLimit: 5,
                    color: '#8B98A5',
                    font: { size: 10, family: 'General Sans' },
                    padding: 8,
                    callback: (value) => {
                        if (Math.abs(value) >= 1_000_000)
                            return (value / 1_000_000).toFixed(1) + 'M';
                        if (Math.abs(value) >= 1_000)
                            return (value / 1_000).toFixed(0) + 'k';
                        return value.toLocaleString('es-AR');
                    },
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(10,14,23,0.88)',
                titleColor: '#94A3B8',
                bodyColor: '#F0F4F8',
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
                titleFont: { size: 11, family: 'General Sans' },
                bodyFont: { size: 13, family: 'Satoshi', weight: '600' },
                callbacks: {
                    title: (items) => items[0]?.label || '',
                    label: (item) => {
                        const val = item.raw;
                        if (Math.abs(val) >= 1_000_000)
                            return (val / 1_000_000).toFixed(2) + 'M';
                        return val.toLocaleString('es-AR');
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
