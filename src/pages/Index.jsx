import { useEffect, useState } from "react";
import { getInitialTheme } from "../utils/functions";
import { fetchData } from "../utils/Fetch";
import { dolarAPI, macroAPI, RiesgoPaisAPI } from "../apis";
import { ChangesCard } from "../components/cambios/CambiosInfoCard";
import { ErrorComponent } from "../components/Error";
import { Loading } from "../components/LoadingAnim";
import { MacroCard } from "../components/macro/MacroInfoCard";
import { categories } from "../MacroFilters";

export default function Index() {
    const [gradient, setGradient] = useState('#aaa'); // Valor inicial
    const [view, setView] = useState('desktop');
    const [theme, setTheme] = useState('light');
    const [macroData, setMacroData] = useState([])
    const [macroDataStatus, setMacroDataStatus] = useState("loading")
    const [dolarData, setDolarData] = useState([])
    const [dolarDataStatus, setDolarDataStatus] = useState('loading')
    const filter = (categorie, object) => object?.filter(item => categorie.includes(item.idVariable)) || [];



    useEffect(()=>{
        const fetching = async()=>{
            const variables = await fetchData(macroAPI)
            const rp = await fetchData(RiesgoPaisAPI)
            const newID = variables.data.results[variables.data.results.length - 1].idVariable + 1

            // Crear un nuevo elemento con un ID único
            const newElement = {
                idVariable: newID, // Genera un ID único
                cdSerie: 5678,
                descripcion: 'Riesgo País',
                fecha: rp.data.fecha,
                valor: rp.data.valor,
            };

            setMacroData([...variables.data.results, newElement]);
            setMacroDataStatus(variables.status);
        };fetching()
    },[])

    useEffect(()=>{
        const fetching = async()=>{
            const res = await fetchData(dolarAPI)
            setDolarData(res.data)
            setDolarDataStatus(res.status)
        };fetching
    },[])

    const handleResize = () => {
        if (window.innerWidth < 648) {
            setView('mobile');
        } else {
            setView('desktop');
        }
    };

    // useEffect para añadir el listener de resize
    useEffect(() => {
        handleResize(); // Ejecuta la función inicialmente
        window.addEventListener('resize', handleResize);

        // Limpia el listener al desmontar el componente
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setTheme(getInitialTheme());
    }, []);

    useEffect(() => {
        setGradient(theme === "dark" ? '#0F172A' : '#aaa');
    }, [theme]);

    console.log(macroData, dolarData)

    return (
        <main className="min-h-screen">
            <section className="h-screen flex flex-col sm:justify-center max-sm:pt-[120px] xl:p-20 md:p-12 index">
                <h2 className="sm:pl-28 text-6xl max-sm:text-center text-[#0049AD] font-bold">
                    INFOPESO
                </h2>
                <div className="flex sm:items-center max-sm:text-center max-sm:mx-auto">
                    <div>
                        <img src="isotipo.png" alt="" className="h-24 lg:h-28 hidden sm:block aspect-square" />
                    </div>
                    <div className="[&>h2]:lg:text-5xl [&>h2]:sm:text-4xl [&>h2]:text-3xl [&>h2]:text-black [&>h2]:dark:text-white [&>h2]:font-bold max-sm:text-center">
                        <h2>Datos financieros</h2>
                        <h2 className="whitespace-nowrap overflow-hidden border-r-4 border-black dark:border-white animate-typing">
                            Al alcance de un click
                        </h2>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes typing {
                        from { width: 0; }
                        to { width: 100%; }
                    }

                    @keyframes blink {
                        50% { border-color: transparent; }
                    }

                    .animate-typing {
                        width: 0;
                        animation: typing 3s steps(30, end) forwards, blink 0.75s step-end infinite;
                    }
                    .index {
                        background: linear-gradient(
                            ${view === 'mobile' ? 'to bottom' : 'to right'},
                            ${gradient} 200px,transparent), url('background.webp');
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-position: 55%;
                    }
                `}</style>
            </section>
            <section className="pt-6">
                <h3 className="text-3xl font-semibold text-center m-auto dark:text-slate-200 py-6">
                    <a href="Cambios">
                        Dólares
                    </a>
                </h3>
                {dolarDataStatus === 'error' && <ErrorComponent message={"Error al cargar los datos"}/>}
                {dolarDataStatus === 'loading' && <Loading />}
                <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 xl:w-[1300px] m-auto">
                {dolarDataStatus === 'success' && dolarData.map((element, index)=> (
                        <ChangesCard
                            key={index}
                            titulo={element.descripcion.split('(')[0].trim()}
                            valor={element.valor}
                            desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                            fecha={element.fecha}
                            id={element.idVariable}
                            chart={{
                                type: "line",
                                duration: "month"
                            }}
                        />
                    ))}
                </div>
                <h3 className="text-3xl font-semibold text-center m-auto dark:text-slate-200 py-6">
                    <a href="Economia">
                        Principales Variables
                    </a>
                </h3>
                {macroDataStatus === 'error' && <ErrorComponent message={"Error al cargar los datos"}/>}
                {macroDataStatus === 'loading' && <Loading />}
                <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 xl:w-[1300px] m-auto">
                {macroDataStatus === 'success' && filter(categories.index ,macroData).map((element, index)=> (
                        <MacroCard
                            key={index}
                            titulo={element.descripcion.split('(')[0].trim()}
                            valor={element.valor}
                            desc={element.descripcion.split('(')[1]?.replace(/[()]/g, '')}
                            fecha={element.fecha}
                            id={element.idVariable}
                            chart={{
                                type: "line",
                                duration: "month"
                            }}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}
