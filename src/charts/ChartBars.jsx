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

const BarsChart = ({ labels, dataset, height = 100, color = '#0066FF', duration }) => {
    // Build per-bar gradient color array
    const colors = dataset.map((v, i, arr) => {
        // Last bar is the latest value
        if (i === arr.length - 1) return color;
        return color + 'AA';
    });

    const data = {
        labels,
        datasets: [
            {
                data: dataset,
                backgroundColor: colors,
                borderRadius: 4,
                borderSkipped: false,
                hoverBackgroundColor: color,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false,
                grid: { display: false },
            },
            y: {
                display: true,
                position: 'right',
                grid: { display: false },
                border: { display: false },
                ticks: {
                    maxTicksLimit: 3,
                    color: '#8B98A5',
                    font: { size: 10, family: 'General Sans' },
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
                    label: (item) => item.raw.toLocaleString('es-AR'),
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
