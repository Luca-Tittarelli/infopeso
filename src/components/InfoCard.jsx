function InfoCard({titulo, valor, desc}){
    return(
        <div className="h-[300px] w-[300px] bg-gray-300 m-auto rounded-[15px]">
            <h2>{titulo}</h2>
            <h3 className="font-bold text-xl">{valor.toLocaleString()}</h3>
            <p>{desc}</p>
        </div>
    )
}
export default InfoCard;