export function LoadingCard(){
    return(
        <article className="h-auto w-full m-auto px-6 py-3 rounded-lg shadow-xl border-[1px] border-gray-300 bg-white dark:border-gray-900 dark:bg-slate-900 flex flex-col justify-between animate-pulse">
            <div>
                <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="flex justify-between items-center mb-1">
                    <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-700 rounded mt-3"></div>
        </article>

    )
}