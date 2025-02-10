import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchData } from "../utils/Fetch";
import { macroAPI, variableAPI } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { getLastYearDate, getTodayDate } from "../utils/functions"
import LineChart from "../charts/ChartLine";

export default function EconomiaDetalle(){
    const [data, setData] = useState([])
    const [dataStatus, setDataStatus] = useState('loading')
    const [chartData, setChartData] = useState([])
    const [chartDataStatus, setChartDataStatus] = useState('loading')
    const params = useParams()

    const getLabels = data => data.map(d => d.fecha)
    const getValues = data => data.map(d => d.valor)

    // Efecto que busca el item dentro de la api 'Principales Variables'
    useEffect(()=>{
        const fetching = async()=>{
            const res = await fetchData(macroAPI)
            if(res.status !== 'success') return
            const filteredData = res?.data?.results?.find(i => i.idVariable == params.id)
            setData(filteredData)
            setDataStatus(res.status)
        }; fetching()
    },[])
    // Efecto Que pide los valores para el gráfico
    useEffect(()=>{
        const fetching = async()=>{
            const lastYearDate = getLastYearDate()
            const todayDate = getTodayDate()
            const res = await fetchData(variableAPI(params.id, lastYearDate, todayDate))
            setChartData(res.data.results)
            setChartDataStatus(res.status)
        };fetching()
    },[])

    return(
        <main className="pt-24 min-h-[70vh]">
            {(chartDataStatus === 'loading' || dataStatus === 'loading') && <Loading />}
            {chartDataStatus !== 'loading' && dataStatus !== 'loading' && (
                <section className="max-w-[1200px] flex flex-col m-auto">
                    <button onClick={()=> history.back()} className="max-h-12 pt-5">
                        <svg className="h-12 " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
                    </button>
                    <h1 className="text-xl font-semibold text-center m-auto pt-4">
                        {data.descripcion}
                    </h1>
                    <LineChart
                        labels={getLabels(chartData)}
                        dataset={getValues(chartData)}
                        height={'100px'}
                        color={'#000'}
                    />
                </section>
            )}
            
        </main>
    )
}