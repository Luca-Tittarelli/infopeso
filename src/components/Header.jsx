import ThemeButton from "../ThemeButton";
import { useState, useEffect } from "react";
import { getInitialTheme } from "../utils/functions";

export default function Header() {
    const [headerStatus, setHeaderStatus] = useState('close');
    
    const responsiveStyles = headerStatus === 'close' 
        ? 'max-sm:translate-y-[-20vh] sm:translate-y-0' 
        : 'max-sm:translate-y-[calc(90px+50px)]';

    const handleHeaderStatus = () => {
        setHeaderStatus(prevStatus => prevStatus === 'close' ? 'open' : 'close');
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.querySelector('html').classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme); // Guarda la preferencia en localStorage
    }, [theme]);

    useEffect(() => {
        const logo = document.querySelector('#logo');
        if (logo) {
            logo.src = theme === "dark" ? 'white-logo.avif' : 'logo.avif';
        }
    }, [theme]);

    const shadow = theme === 'dark' ? "#ccc3" : "#1113"

    const handleChangeTheme = () => {
        setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
    };

    return (
        <header className="h-[90px] w-full fixed shadow-lg dark:bg-slate-900 dark:text-white bg-white flex justify-between items-center sm:px-3 z-20">
            <div className="sm:hidden block w-full h-full absolute bg-inherit"></div>
            <div className="flex items-center basis-0 grow max-sm:absolute h-full user-none">
                <img src="" alt="" className="h-[80%]" id="logo" style={{filter: `drop-shadow(5px 5px 10px ${shadow}`}}/>
            </div>
            <nav className={`max-sm:h-[200px] max-sm:w-screen flex max-sm:items-center justify-center sm:translate-y-0 ${responsiveStyles} transition-transform duration-300 max-sm:bg-gray-100 max-sm:dark:bg-slate-800 -z-10`}>
                <ul className="flex flex-col sm:flex-row basis-0 grow sm:text-base max-sm:items-center max-sm:justify-between [&>li]:text-lg max-sm:[&>li]:p-2 max-sm:py-3 [&>li]:px-4 [&>li]:font-semibold max-sm:[&>li]:text-xl text-center h-full w-full">
                    <li><a href="/" className="hover:dark:text-slate-200 hover:text-gray-700">Inicio</a></li>
                    <li><a href="/Economia" className="hover:dark:text-slate-200 hover:text-gray-700">Economía</a></li>
                    <li><a href="/Cambios" className="hover:dark:text-slate-200 hover:text-gray-700">Tipo de cambios</a></li>
                </ul>
            </nav>
            <div className="flex basis-0 grow justify-end max-sm:absolute right-1">
                <ThemeButton
                    isDark={1}
                    invertedIconLogic={theme === 'dark'} // Ajuste para lógica de icono invertido
                    onChange={handleChangeTheme}
                />
                <button className="sm:hidden mx-2" onClick={handleHeaderStatus}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-menu-2 text-black dark:text-white h-12">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 6l16 0" />
                        <path d="M4 12l16 0" />
                        <path d="M4 18l16 0" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
