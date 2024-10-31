import { useEffect, useState } from "react";
import { filtrarUltimoMes, getDatesRange, getInitialTheme, getLastMonthDate, getYesterdayDate } from "../utils/functions";
import { fetchData } from "../utils/Fetch";
import { dolarAPI, macroAPI, RiesgoPaisAPI, dolarFechaAPI, variableAPI, RiesgoPaisHistoricoAPI } from "../apis";
import { ErrorComponent } from "../components/Error";
import { Loading } from "../components/LoadingAnim";
import { MacroCard } from "../components/macro/MacroInfoCard";
import { indexCategories } from "../MacroFilters";
import { SimplyCard } from "../components/index/SimplyInfoCard";

export default function Index() {
    const [gradient, setGradient] = useState('#aaa'); // Valor inicial
    const [view, setView] = useState('desktop'); //estado para cambiar el gradiente según el dispositivo
    const [theme, setTheme] = useState('light'); //estado que controla el tema de la página
    const [macroData, setMacroData] = useState([]) //estado para cargar la data macroeconomica
    const [lastMacro, setLastMacro] = useState([]) //estado que maneja las anteriores cotizaciones del dolar
    const [macroDataStatus, setMacroDataStatus] = useState("loading") //estado que maneja la carga de este
    const [dolarData, setDolarData] = useState([]) //estado que maneja la data del dolar
    const [lastDolar, setLastDolar] = useState([])
    const [dolarDataStatus, setDolarDataStatus] = useState('loading') //estado que maneja la carga del dolar
    const filter = (categorie, object) => object?.filter(item => categorie.includes(item.idVariable)) || []; //función que filtra los datos según su categoría
    //funcion que maneja el resize y establece el tipo de dispositivo
    const handleResize = () => {
        if (window.innerWidth < 648) {
            setView('mobile');
        } else {
            setView('desktop');
        }
    };
    // Funcion que maneja el fetch en los dolares anteriores
    const handleFetchDolar = async(casa)=>{
        const res = await fetchData(dolarFechaAPI(casa, getYesterdayDate().replace(/-/g, '/')))
        setLastDolar(prevLastDolar => [...prevLastDolar, res.data]);
    }
    //Funcion que obtiene la data anterior de los componentes macro
    const handleFetchMacro = async(id)=>{
        if(id == 44){
            const res = await fetchData(RiesgoPaisHistoricoAPI)
            const rp = filtrarUltimoMes(res.data)[0]
            const newID = macroData[macroData.length - 1].idVariable

            const newElement = {
                idVariable: newID, // Genera un ID único
                fecha: rp.fecha,
                valor: rp.valor,
            };
            console.log(newElement)
            setLastMacro(prevLastMacro => [...prevLastMacro, newElement]);
        }else{
            const dates = getDatesRange()
            const res = await fetchData(variableAPI(id, dates[0], dates[1]))
            setLastMacro(prevLastMacro => [...prevLastMacro, res.data.results[0]]);
        }
    }
    //Efecto para obtener la data macro necesaria
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
    //Efecto que obtiene los anteriores valores macro
    useEffect(()=>{
        if(macroDataStatus === 'success'){
            filter(indexCategories ,macroData).map( i => handleFetchMacro(i.idVariable))
        }
    },[macroData, macroDataStatus])
    //Efecto que obtiene la data del dolar
    useEffect(()=>{
        const fetching = async()=>{
            const res = await fetchData(dolarAPI)
            setDolarData(res.data)
            setDolarDataStatus(res.status)
        };fetching()
    },[])
    // useEffect para obtener los datos anteriores del dolar
    useEffect(() => {
        if (dolarDataStatus === 'success') {
            dolarData.forEach(item => handleFetchDolar(item.casa));
        }
    }, [dolarData, dolarDataStatus]);
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

    console.log(lastMacro)

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
                <style>{`
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
            <section className="pt-6 w-full xl:w-[1250px] m-auto">
                <h3 className="text-3xl font-semibold text-center m-auto dark:text-slate-200 py-10">
                    <a href="Cambios">
                        Dólares
                    </a>
                </h3>
                {dolarDataStatus === 'error' && <ErrorComponent message={"Error al cargar los datos"}/>}
                {dolarDataStatus === 'loading' && <Loading />}
                <div className="info__container grid xl:grid-cols-3 2md:grid-cols-2 grid-cols-1 gap-4 xl:gap-x-3 xl:gap-y-6 w-full m-auto">
                {dolarDataStatus === 'success' && dolarData.map((item, key) => {
                    const lastValue = lastDolar.find(d => d.casa === item.casa)?.venta;
                    if(item.casa === 'mayorista') return
                    return (
                        <SimplyCard
                            titulo={item.nombre}
                            valor={item.venta}
                            valorAnterior={lastValue}
                            fecha={item.fechaActualizacion}
                            key={key}
                        />
                    );
                })}

                </div>
                <h3 className="text-3xl font-semibold text-center m-auto dark:text-slate-200 py-10">
                    <a href="Economia">
                        Principales Variables
                    </a>
                </h3>
                {macroDataStatus === 'error' && <ErrorComponent message={"Error al cargar los datos"}/>}
                {macroDataStatus === 'loading' && <Loading />}
                <div className="info__container grid xl:grid-cols-3 2md:grid-cols-2 grid-cols-1 gap-4 xl:gap-x-3 xl:gap-y-6 w-full m-auto">
                {macroDataStatus === 'success' && filter(indexCategories ,macroData).map((element, index) => {
                    const lastValue = lastMacro.find(m => m.idVariable === element.idVariable)?.valor;
                    return(
                        <SimplyCard
                            titulo={element.descripcion.split('(')[0].trim()}
                            valor={element.valor}
                            valorAnterior={lastValue}
                            fecha={element.fecha}
                            id={element.idVariable}
                            key={index}
                            isMonthly
                        />
                    )
                })}
                </div>
            </section>
        </main>
    );
}
