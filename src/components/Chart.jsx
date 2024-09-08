import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { color } from 'chart.js/helpers';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({labels, dataset, height, color}) => {
  // Datos y configuración del gráfico
  console.log(color)
  const data = {
    labels: labels, // Ejemplo de labels
    datasets: [
      {
        type: 'line',
        label: 'Ventas en 2024',
        data: dataset, // Ejemplo de dataset
        pointRadius: 0,
        borderColor: color,
      },
    ],
  };

  const options = {
    type: 'line',
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
      },
    },
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: false, // Deshabilita el hover de los puntos
      },
      title: {
        display: true,
        text: 'Gráfico Intermensual',
        font: {
          size: 14,
          weight: 'bold',
          color: '#000'
        }
      }
    },
  };

  return (
    <div className='m-auto'>
      <Line data={data} options={options} height={"auto"} height={height}/>
    </div>
  );
};

export default LineChart;
