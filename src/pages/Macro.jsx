import { useState, useEffect } from 'react';
import { MacroCard } from '../components/macro/MacroInfoCard';
import { macroAPI, RiesgoPaisAPI, RiesgoPaisHistoricoAPI } from '../apis';
import { Loading } from '../components/LoadingAnim';
import { fetchData } from '../utils/Fetch';
import { ErrorComponent } from '../components/Error';
import { categories } from '../MacroFilters';
import { filtrarUltimoMes } from '../utils/functions';

function MacroSection({title, data, chart= {type, duration}}){
    return(
        <>
        <h3 className="text-2xl m-auto font-bold text-center dark:text-slate-200 py-12">{title}</h3>
        <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 xl:w-[1300px] m-auto">
            {data.map((element, index)=> (
                <MacroCard
                    key={index}
                    titulo={element.descripcion.split('(')[0].trim()}
                    valor={element.valor}
                    desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                    fecha={element.fecha}
                    id={element.idVariable}
                    chart={{
                        type: chart.type,
                        duration: chart.duration
                    }}
                />
            ))}
        </div>
        </>
    )
}

export default function Macro() {
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState('loading');
    const filter = (categorie) => response?.filter(item => categorie.includes(item.idVariable)) || [];
    const allCategories = Object.values(categories).flat()
    const notIncludes = response?.filter(item => !allCategories.includes(item.idVariable));
    const rpID = response?.[response.length - 1].idVariable

    useEffect(() => {
        const fetching = async () => {
            const macroData = await fetchData(macroAPI);
            const riesgoPaisData = await fetchData(RiesgoPaisAPI);
            const newID = macroData.data.results[macroData.data.results.length - 1].idVariable + 1

            // Crear un nuevo elemento con un ID único
            const newElement = {
                idVariable: newID, // Genera un ID único
                cdSerie: 5678,
                descripcion: 'Riesgo País',
                fecha: riesgoPaisData.data.fecha,
                valor: riesgoPaisData.data.valor,
            };

            setResponse([...macroData.data.results, newElement]);
            setStatus(macroData.status);
        };
        fetching();
    }, []);
    
    console.log(response);

    return (
        <section id="macro" className="pt-[100px] min-h-[100vh]">
            <h2 className="text-4xl text-center text-black dark:text-zinc-300 font-bold py-8">
                Datos de la economía argentina
            </h2>
            {status === "loading" && <Loading />}
            {status === 'error' && <ErrorComponent message={"Error al obtener la información"} />}
            {status === 'success' && response && (
                <div>
                    <MacroSection title={"Inflación"} data={filter(categories.inflacion)} chart={{type: "bars", duration:"year"}}/>
                    <MacroSection title={"BCRA"} data={filter(categories.bcra)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Base Monetaria y circulación"} data={filter(categories.baseMonetaria)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Unidades Financieras"} data={filter(categories.unidadesFinancieras)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Tasas de interés"} data={filter(categories.tasas)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Otros"} data={notIncludes} chart={{type: "line", duration:"month"}}/>
                </div>
            )}
            <h4 className='text-lg dark:text-slate-400 text-gray-800 m-auto text-center mt-8'>Información de <a href="">BCRA</a> y <a href="">ArgentinaDatos API</a></h4>
        </section>
    );
}
