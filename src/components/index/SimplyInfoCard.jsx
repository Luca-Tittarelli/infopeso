export function SimplyCard(titulo, valor, valorAnterior){
    return(        
        <article className="w-[90vw] sm:h-[130px] sm:w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-2 truncate dark:text-slate-200">{titulo}</h2>
                <div className="h-[135px] flex flex-col items-center justify-center">
                </div>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-slate-100 mb-4 flex justify-between">
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
                        {difference}% {duration === 'year' ? 'Anual' : 'Mensual'}
                    </span>
                </h3>
                <p className="text-sm dark:text-slate-400 text-gray-600 mb-6 truncate first-letter:uppercase">{desc}</p>
            </div>
            <div className="flex justify-between">
                <span className="text-sm dark:text-slate-400 text-gray-500 ">{fecha}</span>
                <span className="text-sm dark:text-slate-400 text-gray-500 ">Fuente: {id === 44 ? "ArgentinaDatosAPI" : "BCRA"}</span>
            </div>
        </article>
)
}