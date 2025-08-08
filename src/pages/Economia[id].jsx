import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMacro } from '../hooks/useMacro'
import { fetchData } from "../utils/Fetch";
import { RiesgoPaisHistoricoAPI, variableAPI } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { filtrarUltimoAño, getLastYearDate, getTodayDate } from "../utils/functions"
import LineChart from "../charts/ChartLine";
import {useTheme} from '../hooks/useTheme'

export default function EconomiaDetalle(){
    const {variables, variablesStatus} = useMacro()
    const [theme] = useTheme()
    const [variable, setVariable] = useState('')
    const [chartData, setChartData] = useState([])
    const [chartDataStatus, setChartDataStatus] = useState('loading')
    const params = useParams()

    const options = ["7D", "1M", "3M", "6M", "1Y", "3Y", "5Y"];
    const [selected, setSelected] = useState("15Y");

    const getLabels = data => data.map(d => d.fecha)
    const getValues = data => data.map(d => d.valor)

    // Efecto que busca el item dentro de la api 'Principales Variables'
    useEffect(()=>{
        const filteredData = variables.find(i => i.idVariable == params.id)
        setVariable(filteredData)
    },[variables])

    // Efecto Que pide los valores para el gráfico
    useEffect(()=>{
        const fetching = async()=>{
            if(params.id == 46){
                const res = await fetchData(RiesgoPaisHistoricoAPI)
                setChartData(filtrarUltimoAño(res.data))
                setChartDataStatus(res.status)
            }
            else{
                const lastYearDate = getLastYearDate()
                const todayDate = getTodayDate()
                const res = await fetchData(variableAPI(params.id, lastYearDate, todayDate))
                setChartData(res.data.results.reverse())
                setChartDataStatus(res.status)
            }
        };fetching()
    },[])

    console.log(chartData)

    return(
        <main className="pt-24 min-h-[70vh]">
            {(chartDataStatus === 'loading' || variablesStatus === 'loading') && <Loading />}
            {chartDataStatus !== 'loading' && variablesStatus !== 'loading' && (
                <section className="max-w-[1200px] flex flex-col m-auto">
                    <button onClick={()=> history.back()} className="max-h-12 pt-5">
                        <svg className="h-12 " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
                    </button>
                    <h1 className="text-xl font-semibold text-center m-auto pt-4 text-dark dark:text-light">
                        {variable?.descripcion}
                    </h1>

                    <div className="flex space-x-2 bg-transparent p-2 rounded-lg m-auto mt-4">
                        {options.map((option) => (
                            <button
                                key={option}
                                className={`px-4 py-2 rounded-full text-dark dark:text-light transition border-[1px] border-dark dark:border-light ${
                                    selected === option ? "bg-gray-400 dark:bg-gray-600" : "bg-transparent"
                                }`}
                                onClick={() => setSelected(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                    <LineChart
                        labels={getLabels(chartData)}
                        dataset={getValues(chartData)}
                        height={'100px'}
                        color={theme === 'dark' ? '#fff' : "#000"}
                    />
                </section>
            )}
            
        </main>
    )
}