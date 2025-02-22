import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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

const LineChart = ({ labels, dataset, height, color, duration }) => {
  const title = duration === 'month' ? 'Gráfico Mensual' : duration === 'week' ? 'Gráfico Semanal': 'Gráfico Anual';
  // Datos y configuración del gráfico
  const data = {
    labels: labels, // Ejemplo de labels
    datasets: [
      {
        type: 'line',
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
        ticks: {
          callback: function(value) {
            // Redondea el valor para mostrar un máximo de seis dígitos incluyendo separadores de miles
            let numStr = value.toLocaleString('es-AR');
            if (numStr.length > 6) {
              const parts = numStr.split('.');
              // Devolver solo la parte antes del segundo separador
              numStr = parts.length > 1 ? parts[0] + ',' + parts[1] : parts[0];
            }
            return numStr
          }
        }
      },
    },
    plugins: {
      legend: {
        display: false, // Oculta la leyenda
      },
      tooltip: {
        enabled: true, // Habilita el tooltip
        intersect: false, // Muestra el tooltip en cualquier parte del gráfico
        mode: 'index', // Tooltip se activa basado en el índice más cercano
        callbacks: {
          title: (tooltipItems) => {
            // Muestra el label del eje X (fecha o día) en el título del tooltip
            return `Fecha: ${tooltipItems[0].label}`;
          },
          label: (tooltipItem) => {
            // Muestra el valor en el tooltip
            return `Valor: ${tooltipItem.raw}`;
          }
        },
        displayColors: false, // Elimina los cuadrados de color en el tooltip
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 14,
          weight: 'bold',
          color: '#000',
        },
      },
    },
  };

  return (
    <div className='m-auto w-full'>
      <Line data={data} options={options} height={height} width={'auto'}/>
    </div>
  );
};

export default LineChart;
