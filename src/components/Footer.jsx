export function Footer(){
    return(
        <footer className="mt-20 py-6 dark:text-slate-300 bg-gray-100 dark:bg-slate-950 text-center shadow-sm sm:px-16">
            <h5 className="text-xl font-semibold">Esta página utiliza las siguientes APIS</h5>
            <h6><a href="">Principales Variables - BCRA</a></h6>
            <h6><a href="">DolarAPI</a></h6>
            <h6><a href="">ArgentinaDatosAPI</a></h6>
            <hr className="h-[1px] border-none bg-gray-400 dark:bg-slate-600 w-[full] m-auto my-4"/>
            <h6>El contenido de esta página es de carácter exclusivamente informativo y no constituye asesoramiento financiero en ningún sentido. No ofrecemos recomendaciones específicas ni servicios de consultoría financiera. Para decisiones relacionadas con inversiones o finanzas, se recomienda consultar con un profesional calificado. </h6>
        </footer>
    )
}