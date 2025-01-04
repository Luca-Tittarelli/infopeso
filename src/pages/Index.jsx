import { useEffect, useState } from "react";
import { filtrarUltimoMes, getDatesRange, getInitialTheme, getYesterdayDate } from "../utils/functions";
import { fetchData } from "../utils/Fetch";
import { dolarAPI, macroAPI, RiesgoPaisAPI, dolarFechaAPI, variableAPI, RiesgoPaisHistoricoAPI } from "../apis";
import { ErrorComponent } from "../components/Error";
import { Loading } from "../components/LoadingAnim";
import { indexCategories } from "../MacroFilters";
import { SimplyCard } from "../components/cards/SimplyInfoCard";
import { LoadingCard } from "../components/LoadingCard";

export default function Index() {
    const [gradient, setGradient] = useState('#EDEDED'); // Valor inicial
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
        if(id == 46){
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
        setGradient(theme === "dark" ? '#000320' : '#EDEDED');
    }, [theme]);
    //Efecto del SEO
    useEffect(()=> {
        document.title = 'Infopeso - Datos económicos y cotizaciones de Argentina.'
        document.querySelector('meta[name="description"]')?.setAttribute('content', 
            'Infopeso ofrece datos actualizados de economía y finanzas de Argentina, incluyendo cotizaciones y variables de la economía argentina.'
        )
    },[])

    return (
        <main className="min-h-screen">
            <section className="min-h-screen flex flex-col pt-24 index">
                <div className="flex sm:items-center mx-auto pt-4">
                    <div>
                        <img src="isotipo.png" alt="" className="h-16 lg:h-28 hidden sm:block aspect-square" />
                    </div>
                    <div className="[&>h3]:lg:text-2xl [&>h3]:sm:text-4xl [&>h3]:text-3xl [&>h3]:text-black [&>h3]:dark:text-white [&>h3]:font-bold max-sm:text-center">
                        <h2 className="text-4xl max-sm:text-center text-[#0049AD] font-bold">
                            INFOPESO
                        </h2>
                        <h3>Datos financieros</h3>
                        <h3 className="whitespace-nowrap overflow-hidden border-r-4 border-black dark:border-white animate-typing">
                            Al alcance de un click
                        </h3>
                    </div>
                </div>
                <div className="pt-2 w-full xl:w-[1250px] m-auto">
                    <h3 className="text-3xl font-semibold text-center m-auto dark:text-slate-200 py-4">
                        Panel general
                    </h3>
                    {dolarDataStatus === 'error' || macroDataStatus === 'error' && <ErrorComponent message={"Error al cargar los datos"}/>}
                    <div className="info__container grid gap-2 w-full m-auto px-4"
                        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
                    {dolarDataStatus === 'loading' || macroDataStatus === 'loading' && (
                        Array.from({ length: 12 }).map((_, i) => <LoadingCard key={i} />)
                    )}

                    {dolarDataStatus === 'success' && macroDataStatus === 'success' && (
                        <>
                            {dolarData.map((item, key) => {
                                const lastValue = lastDolar.find(d => d.casa === item.casa)?.venta;

                                // Excluir elementos con "casa" igual a "mayorista"
                                if (item.casa === 'mayorista') return null;
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

                            {filter(indexCategories, macroData).map((element, index) => {
                                const lastValue = lastMacro.find(m => m.idVariable === element.idVariable)?.valor;

                                return (
                                    <SimplyCard
                                        titulo={element.descripcion.split('(')[0].trim()}
                                        valor={element.valor}
                                        valorAnterior={lastValue}
                                        fecha={element.fecha}
                                        id={element.idVariable}
                                        key={`macro-${index}`}
                                        isMonthly
                                    />
                                );
                            })}
                        </>
                    )}

                    
                </div>
            </div>

                <style>{`
                    body{
                        background: #EDEDED 
                    }
                    .dark body{
                        background: #000320
                    }
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
                            ${view === 'mobile' ? 'to top' : 'to top '},
                            ${gradient} , ${theme === 'dark' ? "#0005" : "#fff5"}), url('background.webp');
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-position: 55%;
                    }
                `}</style>
            </section>
        </main>
    );
}
