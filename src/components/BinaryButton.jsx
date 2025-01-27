import { useState } from "react";

export function BinaryToggleButton({ onToggle }) {
    const [selectedOption, setSelectedOption] = useState("Semanal");

    const handleToggle = (option) => {
        setSelectedOption(option);
        onToggle(option);
    };

    return (
        <div className="relative flex items-center bg-gray-300 dark:bg-slate-700 rounded-full border-[2px] border-gray-300 dark:border-slate-700 w-32">
            <button
                onClick={() => handleToggle("Mensual")}
                className={`flex-1 text-center py-2 rounded-full transition-colors duration-300 text-sm ${
                    selectedOption === "Mensual"
                        ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                        : "text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
            >
                Mensual
            </button>
            <button
                onClick={() => handleToggle("Semanal")}
                className={`flex-1 text-center py-2 rounded-full transition-colors duration-300 text-sm ${
                    selectedOption === "Semanal"
                        ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                        : "text-gray-600 dark:text-slate-500 hover:text-gray-800 dark:hover:text-gray-100"
                }`}
            >
                Semanal
            </button>
        </div>
    );
}
