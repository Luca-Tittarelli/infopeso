import { useEffect, useState } from "react";
import { variableAPI } from "../../apis";
import { fetchData } from "../../utils/Fetch";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../Chart";
import { getDatesRange, getLastMonthDate, getTodayDate } from "../../utils/functions";

export function MacroCard({ titulo, valor, desc, fecha, id }) {
    const [difference, setDifference] = useState(0);
    const [differenceStatus, setDifferenceStatus] = useState("loading");
    const [chartData, setChartData] = useState([]);
    const getDates = chartData.map(item => item?.fecha);
    const getValues = chartData.map(item => item?.valor);

    const chartColor = chartData?.length > 0
        ? chartData[0].valor < valor
            ? '#22c55e'
            : chartData[0].valor > valor
            ? '#ef4444'
            : '#6b7280'
        : '#6b7280'; // Default color if no data is available

    useEffect(() => {
        const fetchVariable = async () => {
            let dates = getDatesRange();
            try {
                const res = await fetchData(variableAPI(id, dates[0], dates[1]));
                const previousValue = res.data.results[0]?.valor || 0;

                // Calcular diferencia si previousValue no es 0
                if (previousValue !== 0) {
                    if (id === 17) {
                        const diffPercentage = ((valor - (previousValue * 1000)) / (previousValue * 1000)) * 100;
                        setDifference(diffPercentage.toFixed(2));
                    } else {
                        const diffPercentage = ((valor - previousValue) / previousValue) * 100;
                        setDifference(diffPercentage.toFixed(2));
                    }
                } else {
                    setDifference(0); // Si el valor anterior es 0, no se puede calcular la diferencia
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchVariable();
    }, [id, valor]); // Agregado 'valor' como dependencia para recalcular si cambia

    useEffect(() => {
        const fetching = async () => {
            const lastMonthDate = getLastMonthDate();
            const today = getTodayDate();
            const res = await fetchData(variableAPI(id, lastMonthDate, today));
            setChartData(res.data.results ? res.data.results : []);
        };
        fetching();
    }, [id]);


    return (
        <article className="w-[90vw] sm:h-[330px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-2 truncate dark:text-slate-200">{titulo}</h2>
                <div>
                    <LineChart
                        labels={getDates}
                        dataset={getValues}
                        height={100}
                        color={chartColor}
                    />
                </div>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-4 flex justify-between">
                    <span className="dark:text-slate-200">{valor.toLocaleString()}</span>
                    <span
                        className={`text-base flex items-center ${
                            difference > 0
                                ? 'text-green-500'
                                : difference < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                        }`}
                    >
                        <DifferenceIcon dif={difference} />
                        {differenceStatus === "loading" && (
                            <div className="loading"></div>
                        )}
                        {difference}% Mensual
                    </span>
                </h3>
                <p className="text-sm dark:text-slate-400 text-gray-600 mb-6 truncate first-letter:uppercase">{desc}</p>
            </div>
            <span className="text-sm dark:text-slate-400 text-gray-500 ">{fecha}</span>
        </article>
    );
}
