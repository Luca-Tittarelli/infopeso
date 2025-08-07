import { useEffect } from 'react';
import { MacroCard } from '../components/cards/MacroInfoCard';
import { Loading } from '../components/LoadingAnim';
import { ErrorComponent } from '../components/Error';
import { categories } from '../MacroFilters';
import { useMacro } from '../hooks/useMacro';

function MacroSection({title, data, chart = {type, duration}}){
    return(
        <>
        <h3 className="text-2xl m-auto font-bold text-center dark:text-slate-200 py-12">{title}</h3>
        <div className="info__container grid xl:grid-cols-3 2md:grid-cols-2 grid-cols-1 gap-4 xl:gap-x-3 xl:gap-y-6 pt-10 w-full m-auto">
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

export default function Economia() {
    const { variables, variablesStatus} = useMacro()
    const filter = (categorie) => variables?.filter(item => categorie.includes(item.idVariable)) || [];
    const allCategories = Object.values(categories).flat()
    const notIncludes = variables?.filter(item => !allCategories.includes(item.idVariable));

    //Efecto del SEO
    useEffect(()=> {
        document.title = `Infopeso - Variables al ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`
        document.querySelector('meta[name="description"]')?.setAttribute('content', 
            'Accede a indicadores clave de la economía argentina: inflación, tasas de interés, reservas, riesgo país y más. Información precisa y actualizada para entender el panorama económico.'
        )
    },[])

    console.log(variables)

    return (
        <section id="macro" className="pt-[100px] min-h-[100vh] w-full xl:w-[1250px] m-auto">
            <h2 className="text-4xl text-center text-black dark:text-zinc-300 font-bold py-8">
                Datos de la economía argentina
            </h2>
            {variablesStatus === "loading" && <Loading />}
            {variablesStatus === 'error' && <ErrorComponent message={"Error al obtener la información"} />}
            {variablesStatus === 'success' && variables && (
                <div>
                    <MacroSection title={"BCRA"} data={filter(categories.bcra)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Base Monetaria y circulación"} data={filter(categories.baseMonetaria)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Inflación"} data={filter(categories.inflacion)} chart={{type: "bars", duration:"year"}}/>
                    <MacroSection title={"Tasas de interés"} data={filter(categories.tasas)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Unidades Financieras"} data={filter(categories.unidadesFinancieras)} chart={{type: "line", duration:"month"}}/>
                    <MacroSection title={"Otros"} data={notIncludes} chart={{type: "line", duration:"month"}}/>
                </div>
            )}
            <h4 className='text-lg dark:text-slate-400 text-gray-800 m-auto text-center mt-8'>Información de <a href="https://bcra.gob.ar/Catalogo/apis.asp?fileName=principales-variables-v2&sectionName=Estad%EDsticas">BCRA</a> y <a href="https://argentinadatos.com/">ArgentinaDatos API</a></h4>
        </section>
    );
}
