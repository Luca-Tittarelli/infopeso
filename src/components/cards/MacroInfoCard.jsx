import { useEffect, useState } from "react";
import { RiesgoPaisHistoricoAPI, variableAPI } from "../../apis";
import { fetchData } from "../../utils/Fetch";
import DifferenceIcon from "../../utils/DifferenceIcons";
import LineChart from "../../charts/ChartLine";
import BarsChar from '../../charts/ChartBars'
import { filtrarUltimoMes, getLastMonthDate, getLastYearDate, getTodayDate } from "../../utils/functions";
import { Loading } from "../LoadingAnim";

export function MacroCard({ titulo, valor, desc, fecha, id, chart: { duration, type } }) {
    const [difference, setDifference] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [rpChartData, setRpChartData] = useState([])
    const [chartDataStatus, setChartDataStatus] = useState('loading');
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
        const fetching = async () => {
            let firstDate = getLastMonthDate();
            if (duration === 'year') {
                firstDate = getLastYearDate();
            }
            const today = getTodayDate();
            const res = await fetchData(variableAPI(id, firstDate, today));
            setChartData(res.data.results ? res.data.results : []);
            setChartDataStatus(res.status);
            if(id === 44){
                setChartData(rpChartData)
                setChartDataStatus('success')
            }
        };
        fetching();
    }, [id, duration, rpChartData]);

    //useEffect para obtener la diferencia, ya sea mensual o anual

    useEffect(() => {
        const fetchVariable = async () => {
            const previousValue = chartData[0]?.valor || 0;

            if (previousValue !== 0) {
                if (id === 17) {
                    const diffPercentage = ((valor - (previousValue * 1000)) / (previousValue * 1000)) * 100;
                    setDifference(diffPercentage.toFixed(2));
                } else {
                    const diffPercentage = ((valor - previousValue) / previousValue) * 100;
                    setDifference(diffPercentage.toFixed(2));
                }
            } else {
                setDifference(0);
            }
        };
        fetchVariable();
    }, [id, valor, chartData]);

    useEffect(()=>{
        const fetching = async()=>{
            const res = await fetchData(RiesgoPaisHistoricoAPI)
            setRpChartData(filtrarUltimoMes(res.data))
        };fetching()
    }, [])

    console.log(duration)

    return (
        <article className="w-[90vw] sm:h-[330px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-2 truncate dark:text-slate-200">{titulo}</h2>
                <div className="h-[135px] flex flex-col items-center justify-center">
                    {chartDataStatus === 'loading' && <Loading />}
                    {chartDataStatus === 'error' && <p className="text-gray-600 dark:text-slate-400">No hay gráfico disponible...</p>}
                    {chartDataStatus === 'success' && (
                        type === 'bars' ? (
                            <BarsChar 
                                labels={getDates}
                                dataset={getValues}
                                height={120}
                                color={chartColor}
                                duration={duration}
                            />
                        ) : (
                            <LineChart
                                labels={getDates}
                                dataset={getValues}
                                height={120}
                                color={chartColor}
                                duration={duration}
                            />
                        )
                    )}
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
                        {difference}% {duration === 'year' ? 'Anual' : 'Mensual'}
                    </span>
                </h3>
                <p className="text-sm dark:text-slate-400 text-gray-600 mb-6 truncate first-letter:uppercase">{desc}</p>
            </div>
            <div className="flex justify-between">
                <span className="text-sm dark:text-slate-400 text-gray-500 ">{fecha}</span>
                <span className="text-sm dark:text-slate-400 text-gray-500 ">Fuente: {id === 44 ? "ArgentinaDatosAPI" : "BCRA"}</span>
            </div>
        </article>
    );
}
