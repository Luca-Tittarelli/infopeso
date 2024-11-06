import { useEffect, useState } from "react";
import DifferenceIcon from "../../utils/DifferenceIcons";
import { getTimeDifference } from "../../utils/functions";

export function SimplyCard({ titulo, valor = 0 , valorAnterior = 0 , fecha, isMonthly }){
    const [difference, setDifference] = useState(0);

    useEffect(() => {
        if (valorAnterior !== 0 && valor) {
            setDifference(((valor - valorAnterior) / valorAnterior) * 100);
        } else {
            setDifference(0); // O cualquier otro valor predeterminado
        }
    }, [valorAnterior, valor]);
    

    return(        
        <article className="w-[90vw] h-auto sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-2 truncate dark:text-slate-200">{titulo}</h2>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4 flex justify-between">
                    <span className="dark:text-slate-200">{valor.toLocaleString()}</span>
                    <span
                        className={`text-base flex items-center ${
                            difference > 0
                                ? 'text-green-500'
                                : difference < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                        }`}
                    >
                        <DifferenceIcon dif={difference} />
                        {difference.toFixed(2)}% 
                        {isMonthly ? 'Mensual' : 'Hoy'}
                    </span>
                </h3>
            </div>
            <div className="flex justify-between">
                <span className="text-sm dark:text-slate-400 text-gray-500 ">{getTimeDifference(fecha)}</span>
            </div>
        </article>
)
}