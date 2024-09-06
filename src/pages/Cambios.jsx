import { useState, useEffect } from "react";
import { dolarAPI, dolarHistorico } from "../apis";
import { Loading } from "../components/LoadingAnim";
import { ChangesCard } from "../components/cambios/InfoCard";
import { fetchData } from "../utils/Fetch";
import { getLastMonthDate } from "../utils/functions";

export default function Cambios() {
    const [dolar, setDolar] = useState(null);
    const [dolarStatus, setDolarStatus] = useState('loading');
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
        };fetching();
    }, []);

    useEffect(() => {
        const fetching = async () => {
          const res = await fetchData(dolarHistorico);
          setCotizaciones(filtrarUltimoMes(res.data));
          setCotizacionesStatus(res.status);
        };
        fetching();
    }, []);

    return (
        <section className="pt-[100px]">
            <h2 className="text-4xl text-center text-black font-bold py-8" style={{ textShadow: '2px 2px 2px #eee' }}>
                Tipos de cambio
            </h2>
            <hr className="w-[70%] bg-gray-200 h-[1px] m-auto mt-8 mb-8"/>
            <h3 className="text-2xl m-auto font-bold text-center">Dólar</h3>
            {dolarStatus === "loading" && <Loading />}
            {dolarStatus === "error" && (
                <p className="text-red-500 text-center">Error al cargar los datos.</p>
            )}
            {dolarStatus === "success" && dolar && (
                <div className="grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
                    {dolar.map((item, key) => (
                        <ChangesCard
                            titulo={item.nombre}
                            compra={item.compra}
                            venta={item.venta}
                            key={key}
                            cotizaciones={
                              {
                                status: cotizacionesStatus,
                                data: filtrarPorCasa(cotizaciones, item.casa)
                              }
                            }
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
