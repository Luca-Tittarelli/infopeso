import { useEffect, useState } from "react";
import { getInitialTheme } from "../utils/functions";

export default function Index() {
    const [gradient, setGradient] = useState('#aaa'); // Valor inicial
    const [view, setView] = useState('desktop');
    const [theme, setTheme] = useState('light');

    const handleResize = () => {
        if (window.innerWidth < 648) {
            setView('mobile');
        } else {
            setView('desktop');
        }
    };

    // useEffect para añadir el listener de resize
    useEffect(() => {
        handleResize(); // Ejecuta la función inicialmente
        window.addEventListener('resize', handleResize);

        // Limpia el listener al desmontar el componente
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setTheme(getInitialTheme());
    }, []);

    useEffect(() => {
        setGradient(theme === "dark" ? '#0F172A' : '#aaa');
    }, [theme]);

    return (
        <main className="min-h-screen">
            <section className="h-screen flex flex-col sm:justify-center max-sm:pt-[120px] xl:p-20 md:p-12 index">
                <h2 className="sm:pl-28 text-6xl max-sm:text-center text-[#0049AD] font-bold">
                    INFOPESO
                </h2>
                <div className="flex sm:items-center max-sm:text-center max-sm:mx-auto">
                    <div>
                        <img src="isotipo.png" alt="" className="h-24 lg:h-28 hidden sm:block aspect-square" />
                    </div>
                    <div className="[&>h2]:lg:text-5xl [&>h2]:sm:text-4xl [&>h2]:text-3xl [&>h2]:text-black [&>h2]:dark:text-white [&>h2]:font-bold max-sm:text-center">
                        <h2>Datos financieros</h2>
                        <h2 className="whitespace-nowrap overflow-hidden border-r-4 border-black dark:border-white animate-typing">
                            Al alcance de un click
                        </h2>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes typing {
                        from { width: 0; }
                        to { width: 100%; }
                    }

                    @keyframes blink {
                        50% { border-color: transparent; }
                    }

                    .animate-typing {
                        width: 0;
                        animation: typing 3s steps(30, end) forwards, blink 0.75s step-end infinite;
                    }
                    .index {
                        background: linear-gradient(
                            ${view === 'mobile' ? 'to bottom' : 'to right'},
                            ${gradient} 200px,transparent), url('background.webp');
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-position: 55%;
                    }
                `}</style>
            </section>
        </main>
    );
}
