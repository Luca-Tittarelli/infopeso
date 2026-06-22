import { useState, useEffect } from "react";
import { fetchData } from "../utils/Fetch";
import { PBIApi, PBIGrowthApi, PBIIndustryApi, PBIAgricultureApi, PBIServicesApi, PBIManufacturingApi } from "../apis";

export function usePBI() {
    const [pbiData, setPbiData] = useState([]);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        const fetchPBI = async () => {
            try {
                setStatus('loading');
                
                // Fetch all endpoints
                const [
                    totalRes,
                    growthRes,
                    industryRes,
                    agriRes,
                    servicesRes,
                    manufacRes
                ] = await Promise.all([
                    fetchData(PBIApi),
                    fetchData(PBIGrowthApi),
                    fetchData(PBIIndustryApi),
                    fetchData(PBIAgricultureApi),
                    fetchData(PBIServicesApi),
                    fetchData(PBIManufacturingApi)
                ]);

                // Helper para extraer el último dato no nulo y su historial
                const extractData = (res, title, desc, formatFn = (v) => v) => {
                    const series = res.data?.[1] || [];
                    const validData = series.filter(item => item.value !== null);
                    
                    if (validData.length === 0) return null;
                    
                    const latest = validData[0];
                    const previous = validData[1];
                    
                    // Calcular diferencia porcentual interanual si existe el previo
                    let difference = 0;
                    if (previous && previous.value) {
                        difference = ((latest.value - previous.value) / Math.abs(previous.value)) * 100;
                    }

                    // Formatear historial para el gráfico (últimos 10 años)
                    const history = validData.slice(0, 10).reverse().map(item => ({
                        fecha: item.date,
                        valor: item.value
                    }));

                    return {
                        idVariable: title.replace(/\s+/g, '-').toLowerCase(),
                        descripcion: `${title} (${desc})`,
                        valor: formatFn(latest.value),
                        fecha: latest.date,
                        difference,
                        history,
                        rawValor: latest.value
                    };
                };

                const formatUSD = (val) => {
                    if (val >= 1e12) return `$ ${(val / 1e12).toFixed(2)} Billones USD`;
                    if (val >= 1e9) return `$ ${(val / 1e9).toFixed(2)} Mil Millones USD`;
                    return `$ ${val.toLocaleString('es-AR')} USD`;
                };

                const formatPct = (val) => `${val.toFixed(2)}%`;

                const results = [
                    extractData(totalRes, 'PBI Total', 'en dólares corrientes', formatUSD),
                    extractData(growthRes, 'Crecimiento PBI', 'anual %', formatPct),
                    extractData(servicesRes, 'Sector Servicios', '% del PBI', formatPct),
                    extractData(industryRes, 'Sector Industrial', '% del PBI', formatPct),
                    extractData(agriRes, 'Sector Agropecuario', '% del PBI', formatPct),
                    extractData(manufacRes, 'Manufactura', '% del PBI', formatPct)
                ].filter(Boolean); // Filtrar nulos por si alguna API falla

                setPbiData(results);
                setStatus('success');

            } catch (error) {
                console.error("Error fetching PBI data:", error);
                setStatus('error');
            }
        };

        fetchPBI();
    }, []);

    return { pbiData, pbiStatus: status };
}
