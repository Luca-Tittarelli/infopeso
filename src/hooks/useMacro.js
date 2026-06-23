import { useState, useEffect } from "react";
import { fetchData } from "../utils/Fetch";
import { macroAPI, RiesgoPaisAPI } from "../apis";

export function useMacro(initialData = null){
    const [response, setResponse] = useState(initialData || []);
    const [status, setStatus] = useState(initialData && initialData.length > 0 ? 'success' : 'loading');
    
    useEffect(() => {
        if (initialData && initialData.length > 0) return;
        const fetching = async () => {
            const macroData = await fetchData(macroAPI);
            const riesgoPaisData = await fetchData(RiesgoPaisAPI);

            // Fetch the results and map the new v4.0 properties to the expected ones
            const mappedResults = macroData.data.results ? macroData.data.results.map((item) => ({
                ...item,
                valor: item.ultValorInformado,
                fecha: item.ultFechaInformada,
            })) : [];

            // Prevent error if macroData failed
            const lastId = mappedResults.length > 0 ? mappedResults[mappedResults.length - 1].idVariable : 0;

            // Crear un nuevo elemento con un ID único
            const newElement = {
                idVariable: 'riesgo-pais', // Genera un ID único preventivo
                cdSerie: 5678,
                descripcion: 'Riesgo País',
                fecha: riesgoPaisData.data?.fecha || '',
                valor: riesgoPaisData.data?.valor || 0,
            };

            setResponse([...mappedResults, newElement]);
            setStatus(macroData.status);
        };
        fetching();
    }, [initialData]);
    return{
        variables: response,
        variablesStatus: status
    }
}