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
        <article className="h-auto w-full m-auto px-6 py-3 rounded-lg shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <h2 className="text-lg font-bold mb-2 truncate dark:text-slate-200">{titulo}</h2>
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1 flex justify-between">
                    <span className="dark:text-slate-200 text-xl">{valor.toLocaleString()}</span>
                    <span
                        className={`text-sm flex items-center ${
                            difference > 0
                                ? 'text-green-500'
                                : difference < 0
                                ? 'text-red-500'
                                : 'text-gray-500'
                        }`}
                    >
                        <DifferenceIcon dif={difference} />
                        {difference.toFixed(2)}%&nbsp;
                        {isMonthly ? 'Mensual' : 'Hoy'}
                    </span>
                </h3>
            </div>
            <span className="text-sm dark:text-slate-500 text-gray-400">{getTimeDifference(fecha)}</span>
        </article>
)
}