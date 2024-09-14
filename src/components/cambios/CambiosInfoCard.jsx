import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../Chart";
import { getTimeDifference } from "../../utils/functions";

export function ChangesCard({ titulo, compra, venta, cotizaciones, fecha, chart }) {
    const [difference, setDifference] = useState(0);

    const precioMes = (precios) => precios.map(item => item.venta);
    const labels = (labels) => labels.map(label => label.fecha);

    const chartColor = cotizaciones?.data?.length > 0
            ? precioMes(cotizaciones.data)[0] < venta
                ? '#22c55e'
                : precioMes(cotizaciones.data)[0] > venta
                ? '#ef4444'
                : '#6b7280'
            : '#6b7280'; // Default color if no data is available

    // Obtén el valor de venta del último elemento de cotizaciones
    const ventaAnterior =
        cotizaciones?.data?.length > 0 ? cotizaciones.data[cotizaciones.data.length - 1].venta : 0;

    useEffect(() => {
        // Verifica si `ventaAnterior` y `venta` son diferentes de 0 para evitar divisiones por cero
        if (ventaAnterior === 0 || venta === 0) return;

        // Calcula la diferencia en porcentaje y formatea a dos decimales
        const diff = ((venta - ventaAnterior) / ventaAnterior) * 100;
        setDifference(diff.toFixed(2));
    }, [venta, ventaAnterior]);

    console.log(cotizaciones)

    return (
        <article className="w-[90vw] h-[330px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col items-stretch justify-between">
            <h3 className="text-xl font-bold mb-2 dark:text-slate-200 truncate">{titulo}</h3>
            {chart && cotizaciones?.data?.length > 0 && (
                <div className="h-max-[50px]">
                    <LineChart
                        dataset={precioMes(cotizaciones.data)}
                        labels={labels(cotizaciones.data)}
                        height={130}
                        color={chartColor}
                    />
                </div>
            )}
            <div className="flex justify-between text-center">
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4">
                    Compra
                    <p className="font-bold">${compra}</p>
                </span>
                {cotizaciones && (
                    <span
                        className={`text-base flex items-center text-center m-auto font-bold ${
                            difference > 0
                                ? 'text-green-500'
                                : difference < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                        }`}
                    >
                        <DifferenceIcon dif={difference} />
                        {difference}% Hoy
                    </span>
                )}
                <span className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-4">
                    Venta
                    <p className="font-bold">${venta}</p>
                </span>
            </div>
            <p className="text-sm text-gray-600">{getTimeDifference(fecha)}</p>
        </article>
    );
}
