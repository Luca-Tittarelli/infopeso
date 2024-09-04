function InfoCard({titulo, valor, desc, fecha}){
    return(
        <article className="h-[300px] w-[370px] m-auto p-6 rounded-[15px] shadow-xl border-2 border-gray-500 bg-white">
            <h2 className="text-xl font-bold mb-2 truncate">{titulo}</h2>
            <h3 className="text-4xl font-extrabold text-gray-800 mb-4">{valor.toLocaleString()}</h3>
            <p className="text-gray-600 mb-6">{desc}</p>
            <span className="text-sm text-gray-500">{fecha}</span>
        </article>

    )
}
export default InfoCard;