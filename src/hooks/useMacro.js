import { useState, useEffect } from "react";
import { fetchData } from "../utils/Fetch";
import { macroAPI, RiesgoPaisAPI } from "../apis";

export function useMacro(){
    const [response, setResponse] = useState([]);
    const [status, setStatus] = useState('loading');
    
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
    return{
        variables: response,
        variablesStatus: status
    }
}