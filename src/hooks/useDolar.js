import { useEffect, useState } from "react";
import { dolarAPI, dolarHistoricoAPI } from "../apis";
import { fetchData } from "../utils/Fetch";

export function useDolar() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [cotizacionesStatus, setCotizacionesStatus] = useState('loading');
    const [dolar, setDolar] = useState(null);
    const [dolarStatus, setDolarStatus] = useState('loading');

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
            const res = await fetchData(dolarHistoricoAPI);
            console.log(dolarHistoricoAPI)
            setCotizaciones(res.data);
            setCotizacionesStatus(res.status);
        };
        fetching();
    }, []);

    return {
        cotizaciones,
        cotizacionesStatus,
        dolar,
        dolarStatus,
    };
}