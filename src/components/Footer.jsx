export function Footer(){
    return(
        <footer className="mt-20 py-6 dark:text-slate-300 bg-gray-100 dark:bg-slate-950 text-center shadow-sm sm:px-16">
            <h3 className="text-2xl font-semibold text-center">Apoyá el proyecto</h3>
            <a href="https://cafecito.app/ucode-wd" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border-slate-400 border-[1px] text-black dark:text-slate-300 rounded-lg font-bold no-underline my-4">
                    <img src="https://cdn.cafecito.app/imgs/cafecito_logo.svg" alt="Cafecito" className="h-6 mr-2" />
                    Cafecito
            </a>

            <h5 className="text-xl font-semibold">Esta página utiliza las siguientes APIS</h5>
            <h6><a href="https://bcra.gob.ar/Catalogo/apis.asp?fileName=principales-variables-v2&sectionName=Estad%EDsticas">
                Principales Variables - BCRA
            </a></h6>
            <h6><a href="https://dolarapi.com/">
                DolarAPI
            </a></h6>
            <h6><a href="https://argentinadatos.com/">
                ArgentinaDatosAPI
            </a></h6>
            <hr className="h-[1px] border-none bg-gray-400 dark:bg-slate-600 w-[full] m-auto my-4"/>
            <h6>El contenido de esta página es de carácter exclusivamente informativo y no constituye asesoramiento financiero en ningún sentido. No ofrecemos recomendaciones específicas ni servicios de consultoría financiera. Para decisiones relacionadas con inversiones o finanzas, se recomienda consultar con un profesional calificado. No nos hacemos responsables de la certeza de los datos aquí presentados.</h6>
        </footer>
    )
}