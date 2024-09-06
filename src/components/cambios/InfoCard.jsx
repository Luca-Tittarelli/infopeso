import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";

export function ChangesCard({ titulo, compra, venta, cotizaciones }) {
    const [difference, setDifference] = useState(0);

    // Obtén el valor de venta del último elemento de cotizaciones
    const ventaAnterior = cotizaciones.data.length > 0 ? cotizaciones.data[cotizaciones.data.length - 1].venta : 0;

    useEffect(() => {
        // Verifica si `ventaAnterior` y `venta` son diferentes de 0 para evitar divisiones por cero
        if (ventaAnterior === 0 || venta === 0) return;
        
        // Calcula la diferencia en porcentaje y formatea a dos decimales
        const diff = ((venta - ventaAnterior) / ventaAnterior) * 100;
        setDifference(diff.toFixed(2));
    }, [venta, ventaAnterior]);

    return (
        <article className="w-[90vw] sm:h-[320px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white flex flex-col items-stretch justify-between">
            <h3 className="text-xl font-bold mb-2 truncate">{titulo}</h3>
            {cotizaciones.status === 'success' && cotizaciones.data.length > 0 && (
                <p>{cotizaciones.data[0].casa}</p>
            )}
            <div className="flex justify-between text-center">
                <span className="text-2xl font-bold text-gray-800 mb-4">
                    Compra
                    <p className="font-bold">${compra}</p>
                </span>
                <span className="text-2xl font-bold text-gray-800 mb-4">
                    Venta
                    <p className="font-bold">${venta}</p>
                    <span
                        className={`text-base flex items-center ${
                            difference > 0
                                ? 'text-green-500'
                                : difference < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                        }`}
                    >
                        <DifferenceIcon dif={difference}/>
                        {difference}% Hoy
                    </span>
                </span>
            </div>
        </article>
    );
}
