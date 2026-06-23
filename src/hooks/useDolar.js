import { useEffect, useState } from "react";
import { dolarAPI, dolarHistoricoAPI } from "../apis";
import { fetchData } from "../utils/Fetch";

export function useDolar(initialData = null) {
    const [cotizaciones, setCotizaciones] = useState(initialData?.cotizaciones || []);
    const [cotizacionesStatus, setCotizacionesStatus] = useState(initialData?.cotizaciones ? 'success' : 'loading');
    const [dolar, setDolar] = useState(initialData?.dolar || null);
    const [dolarStatus, setDolarStatus] = useState(initialData?.dolar ? 'success' : 'loading');

    useEffect(() => {
        if (initialData?.dolar) return;
        const fetching = async () => {
            const res = await fetchData(dolarAPI);
            setDolar(res.data);
            setDolarStatus(res.status);
        };
        fetching();
    }, [initialData]);

    useEffect(() => {
        if (initialData?.cotizaciones) return;
        const fetching = async () => {
            const res = await fetchData(dolarHistoricoAPI);
            setCotizaciones(res.data);
            setCotizacionesStatus(res.status);
        };
        fetching();
    }, [initialData]);

    return {
        cotizaciones,
        cotizacionesStatus,
        dolar,
        dolarStatus,
    };
}