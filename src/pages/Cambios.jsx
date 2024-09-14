import { useState, useEffect } from "react";
import { dolarAPI, dolarHistorico, otros } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { ChangesCard } from "../components/cambios/CambiosInfoCard"
import { fetchData } from "../utils/Fetch";
import { getLastMonthDate } from "../utils/functions";
import { ErrorComponent } from "../components/Error";

export default function Cambios() {
    const [dolar, setDolar] = useState(null);
    const [dolarStatus, setDolarStatus] = useState('loading');
    const [others, setOthers] = useState(null);
    const [othersStatus, setOthersStatus] = useState('loading');
    const [cotizaciones, setCotizaciones] = useState([]);
    const [cotizacionesStatus, setCotizacionesStatus] = useState('loading');

    const filtrarUltimoMes = (cotizaciones) => {
        const lastMonthDate = getLastMonthDate();
        const today = new Date();

        return cotizaciones.filter(cotizacion => {
            const fechaCotizacion = new Date(cotizacion.fecha);
            return fechaCotizacion >= new Date(lastMonthDate) && fechaCotizacion <= today;
        });
    };

    const filtrarPorCasa = (data, casa) => {
        return data.filter(cotizacion => cotizacion.casa === casa);
    };

    useEffect(() => {
        const fetching = async () => {
            const res = await fetchData(dolarAPI);
            setDolar(res.data);
            setDolarStatus(res.status);
        };
        fetching();
    }, []);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetchData(dolarHistorico);
            setCotizaciones(filtrarUltimoMes(res.data));
            setCotizacionesStatus(res.status);
        };
        fetching();
    }, []);

    useEffect(() => {
        const fetching = async () => {
            const res = await fetchData(otros);
            setOthers(res.data);
            setOthersStatus(res.status);
        };
        fetching();
    }, []);
    
    
    console.log();

    return (
        <section className="pt-[100px]">
            <h2 className="text-4xl text-center text-black dark:text-slate-200 font-bold py-8">
                Tipos de cambio
            </h2>
            <hr className="xl:w-[1300px] dark:bg-slate-900 bg-gray-200 h-[1px] m-auto mt-8 mb-8 border-none" />
            <div>
                <h3 className="text-2xl m-auto font-bold text-center dark:text-slate-200">Dólar</h3>
                {dolarStatus === "loading" && <Loading />}
                {dolarStatus === "error" && <ErrorComponent message={"Error al obtener los datos del dólar"}/>}
                {dolarStatus === "success" && dolar && (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
                        {dolar.map((item, key) => (
                            <ChangesCard
                                titulo={item.nombre}
                                compra={item.compra}
                                venta={item.venta}
                                fecha={item.fechaActualizacion}
                                key={key}
                                chart={true}
                                cotizaciones={{
                                    status: cotizacionesStatus,
                                    data: filtrarPorCasa(cotizaciones, item.casa)
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-2xl m-auto font-bold text-center pt-10 dark:text-slate-200">Otros tipos de cambio</h3>
                {othersStatus === "loading" && <Loading />}
                {othersStatus === "error" && <ErrorComponent message={"Error al obtener los datos de otras cotizaciones"}/>}
                {othersStatus === "success" && dolar && (
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
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
                )}
            </div>
        </section>
    );
}
