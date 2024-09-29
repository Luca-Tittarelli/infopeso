import React from 'react';
import { Bar } from 'react-chartjs-2'; // Cambia Line por Bar
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, // Añade BarElement para gráficos de barras
  Title,
  Tooltip,
  Legend
);

const BarsChart = ({ labels, dataset, height, color }) => {
  // Datos y configuración del gráfico
  const data = {
    labels: labels,
    datasets: [
      {
        type: 'bar',
        data: dataset,
        backgroundColor: color, // Color de las barras
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          display: false // Oculta las etiquetas del eje x
        },
        grid: {
          display: false, // Elimina las líneas de referencia en el eje x
        },
      },
      y: {
        grid: {
          display: false, // Elimina las líneas de referencia en el eje y
        },
        ticks: {
          callback: function(value) {
            let numStr = value.toLocaleString('es-AR');
            if (numStr.length > 6) {
              const parts = numStr.split('.');
              numStr = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
            }
            return numStr;
          }
        }
      },
    },
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: true,
        intersect: false,
        mode: 'index',
        callbacks: {
          title: (tooltipItems) => `Fecha: ${tooltipItems[0].label}`,
          label: (tooltipItem) => `Valor: ${tooltipItem.raw}`,
        },
        displayColors: false,
      },
      title: {
        display: true,
        text: 'Gráfico Interanual',
        font: {
          size: 14,
          weight: 'bold',
        },
      },
    },
  };

  return (
    <div className='m-auto'>
      <Bar data={data} options={options} height={height} width={'auto'} /> {/* Cambia Line por Bar */}
    </div>
  );
};

export default BarsChart;
