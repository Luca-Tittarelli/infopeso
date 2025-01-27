import { useState, useEffect } from "react";
import { dolarAPI, dolarHistoricoAPI, cotizacionesAPI } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { ChangesCard } from "../components/cards/CambiosInfoCard";
import { fetchData } from "../utils/Fetch";
import { ErrorComponent } from "../components/Error";
import { filtrarUltimoAño, filtrarUltimoMes } from "../utils/functions";
import { useDolar } from "../hooks/useDolar";

export default function Cambios() {
    const {dolar, dolarStatus, cotizaciones, cotizacionesStatus} = useDolar()
    const [others, setOthers] = useState(null);
    const [othersStatus, setOthersStatus] = useState('loading');
    
    const filtrarPorCasa = (data, casa) => {
        return data.filter(cotizacion => cotizacion.casa === casa);
    };
        
    useEffect(() => {
        const fetching = async () => {
            const res = await fetchData(cotizacionesAPI);
            setOthers(res.data);
            setOthersStatus(res.status);
        };
        fetching();
    }, []);
    
    //Efecto del SEO
    useEffect(()=> {
        document.title = `Infopeso - Cotizaciones al ${new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}`
        document.querySelector('meta[name="description"]')?.setAttribute('content', 
            'Consulta las cotizaciones actualizadas del dólar en Argentina, incluyendo Oficial, Blue, CCL, MEP y otras monedas. Datos confiables y análisis en tiempo real para tomar mejores decisiones financieras.'
        )
    },[])

    return (
        <section className="pt-[100px] min-h-[100vh] w-full xl:w-[1250px] m-auto">
            
        <title>Argendata - Tipos de cambio</title>
            <h2 className="text-4xl text-center text-black dark:text-slate-200 font-bold py-8">
                Tipos de cambio
            </h2>
            <div>
                <h3 className="text-2xl m-auto font-bold text-center dark:text-slate-200 py-12">Dólar</h3>
                {dolarStatus === "loading" && <Loading />}
                {dolarStatus === "error" && <ErrorComponent message={"Error al obtener los datos del dólar"}/>}
                {dolarStatus === "success" && dolar && (
                    <div className="grid xl:grid-cols-3 2md:grid-cols-2 grid-cols-1 gap-4 xl:gap-x-3 xl:gap-y-6 pt-10 w-full m-auto">
                        {dolar.map((item, key) => {
                            if (item.casa === 'mayorista') return null;
                            return (
                                <ChangesCard
                                    titulo={item.nombre}
                                    compra={item.compra}
                                    venta={item.venta}
                                    fecha={item.fechaActualizacion}
                                    key={key}
                                    chart={{
                                        type: 'line',
                                        duration: 'month'
                                    }}
                                    cotizaciones={{
                                        status: cotizacionesStatus,
                                        data: filtrarPorCasa(
                                            filtrarUltimoMes(cotizaciones),
                                            item.casa
                                        )
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl m-auto font-bold text-center pt-10 dark:text-slate-200">Otros tipos de cambio</h3>
                {othersStatus === "loading" && <Loading />}
                {othersStatus === "error" && <ErrorComponent message={"Error al obtener los datos de otras cotizaciones"}/>}
                {othersStatus === "success" && dolar && (
                    <div>
                        <div className="grid xl:grid-cols-3 2md:grid-cols-2 grid-cols-1 gap-4 xl:gap-x-3 xl:gap-y-6 pt-10 w-full m-auto">
                            {others.map((item, key) => (
                                <ChangesCard
                                    titulo={item.nombre}
                                    compra={item.compra.toFixed(1)}
                                    venta={item.venta.toFixed(1)}
                                    fecha={item.fechaActualizacion}
                                    key={key}
                                    chart={false}
                                />
                            ))}
                        </div>
                        <h4 className='text-lg dark:text-slate-400 text-gray-800 m-auto text-center my-4'>Información de <a href="https://dolarapi.com">DolarAPI</a></h4>
                    </div>
                )}
            </div>
        </section>
    );
}
