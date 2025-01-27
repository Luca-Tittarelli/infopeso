import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../../charts/ChartLine";
import { filtrarUltimaSemana, getTimeDifference } from "../../utils/functions";
import { BinaryToggleButton } from "../BinaryButton";

export function ChangesCard({ titulo, compra, venta, cotizaciones, fecha, chart: { type } }) {
    const [difference, setDifference] = useState(0);
    const [duration, setDuration] = useState("week");
    const [chartData, setChartData] = useState([]);
    const [chartColor, setChartColor] = useState('#6b7280')

    console.log(cotizaciones)

    const labels = (labels) => labels.map(label => label.fecha);
    const values = (values) => values.map(value => value.venta);

    // Obtén el valor de venta del último elemento de cotizaciones
    const ventaAnterior = cotizaciones?.data?.length > 0 ? cotizaciones.data[cotizaciones.data.length - 1].venta : 0;

    useEffect(() => {
        // Verifica si `ventaAnterior` y `venta` son diferentes de 0 para evitar divisiones por cero
        if (ventaAnterior === 0 || venta === 0) return;

        // Calcula la diferencia en porcentaje y formatea a dos decimales
        const diff = ((venta - ventaAnterior) / ventaAnterior) * 100;
        setDifference(diff.toFixed(2));
    }, [venta, ventaAnterior]);

    useEffect(() => {
        if (cotizaciones?.data?.length > 0) {
            const filteredData = duration === 'month'
                ? cotizaciones.data
                : filtrarUltimaSemana(cotizaciones.data);

            setChartData(filteredData || []); // Asegúrate de que siempre sea un array
        } else {
            setChartData([]); // No hay datos disponibles
        }
    }, [duration, cotizaciones]);

    useEffect(() => {
        if (chartData?.length > 0) {
            setChartColor(chartData[0].venta < venta
                ? '#22c55e'
                : chartData[0].venta > venta
                    ? '#ef4444'
                    : '#6b7280'
            );
        }
    }, [chartData, venta]);

    return (
        <article className="w-[90vw] h-[330px] xsm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col items-stretch justify-between">
            <div className="flex justify-between">
                <h3 className="text-xl font-bold mb-2 dark:text-slate-200 truncate">{titulo}</h3>
                <BinaryToggleButton
                    onToggle={(selectedOption) =>
                        setDuration(selectedOption === "Mensual" ? "month" : "week")
                    }
                />
            </div>
            {cotizaciones?.data?.length > 0 ? (
                <div className="h-max-[50px]">
                    <LineChart
                        dataset={values(chartData)}
                        labels={labels(chartData)}
                        height={130}
                        color={chartColor}
                        duration={duration}
                    />
                </div>
            ) : (
                <p className="text-gray-600 dark:text-slate-400 m-auto text-center">No hay gráfico disponible...</p>
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
