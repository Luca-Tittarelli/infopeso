export default function Header(){
    return(
        <header className="h-[90px] w-full fixed shadow-lg bg-white flex justify-between items-center">
            <h1>Morlaco</h1>
            <nav>
                <ul className="flex text-l [&>li]:px-4">
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/Macro">Macro</a></li>
                    <li><a href="/Cambios">Tipo de cambios</a></li>
                </ul>
            </nav>
        </header>
    )
}