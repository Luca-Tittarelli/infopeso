import ThemeButton from "../ThemeButton";
import { useState, useEffect } from "react";

export default function Header(){
    const getInitialTheme = () => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.querySelector('html').classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme); // Guarda la preferencia en localStorage
    }, [theme]);

    const handleChangeTheme = () => {
        setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
    };

    return(
        <header className="h-[90px] w-full fixed shadow-lg dark:bg-slate-900 dark:text-white bg-white flex justify-between items-center px-2">
            <div className="flex basis-0 grow">
                <h1>Datonómicos</h1>
            </div>
            <nav>
                <ul className="flex basis-0 grow text-l [&>li]:px-4 [&>li]:font-bold">
                    <li><a href="/">Inicio</a></li>
                    <li><a href="/Macro">Macro</a></li>
                    <li><a href="/Cambios">Tipo de cambios</a></li>
                    <li><a href="/Mercado">Mercado</a></li>
                </ul>
            </nav>
            <div className="flex basis-0 grow justify-end">
                <ThemeButton
                    isDark={1}
                    invertedIconLogic={theme === 'dark' ? true : false} // Asigna la propiedad condicionalmente
                    onChange={handleChangeTheme} 
                />
            </div>
        </header>
    )
}