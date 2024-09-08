import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../Chart";
import { diferenciaTiempo } from "../../utils/functions";

export function ChangesCard({ titulo, compra, venta, cotizaciones, fecha }) {
    const [difference, setDifference] = useState(0);
    const precioMes = (precios) => precios.map(item => item.venta);
    const labels = (labels) => labels.map(label => label.fecha);
    const chartColor = precioMes(cotizaciones.data)[0] < venta ? '#22c55e' : precioMes(cotizaciones.data)[0] > venta ? '#ef4444' : '#6b7280'; // Green for negative, red for positive

    // Obtén el valor de venta del último elemento de cotizaciones
    const ventaAnterior = cotizaciones.data.length > 0 ? cotizaciones.data[cotizaciones.data.length - 1].venta : 0;

    useEffect(() => {
        // Verifica si `ventaAnterior` y `venta` son diferentes de 0 para evitar divisiones por cero
        if (ventaAnterior === 0 || venta === 0) return;
        
        // Calcula la diferencia en porcentaje y formatea a dos decimales
        const diff = ((venta - ventaAnterior) / ventaAnterior) * 100;
        setDifference(diff.toFixed(2));
    }, [venta, ventaAnterior]);

    console.log(precioMes(cotizaciones.data)[0])
    return (
        <article className="w-[90vw] h-[320px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white flex flex-col items-stretch justify-between">
            <h3 className="text-xl font-bold mb-2 truncate">{titulo}</h3>
            <div className="h-max-[50px]">
                <LineChart 
                    dataset={precioMes(cotizaciones.data)} 
                    labels={labels(cotizaciones.data)} 
                    height={100}
                    color={chartColor}
                />
            </div>
            <div className="flex justify-between text-center">
                <span className="text-2xl font-bold text-gray-800 mb-4">
                    Compra
                    <p className="font-bold">${compra}</p>
                </span>
                <span
                    className={`text-base flex items-center text-center m-auto font-bold ${
                    difference > 0
                        ? 'text-green-500'
                        : difference < 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                    >
                    <DifferenceIcon dif={difference}/>
                    {difference}% Hoy
                </span>
                <span className="text-2xl font-bold text-gray-800 mb-4">
                    Venta
                    <p className="font-bold">${venta}</p>
                </span>
            </div>
            <p className="text-sm text-gray-600">{diferenciaTiempo(fecha)}</p>
        </article>
    );
}
