import { useEffect, useState } from "react";
import { variableAPI } from "../apis";
import DifferenceIcon from "../utils/DifferenceIcons";

function InfoCard({ titulo, valor, desc, fecha, id }) {
    const [value, setValue] = useState(0);
    const [difference, setDifference] = useState(0)

    const getLastMonthDate = () => {
        const today = new Date();
        const lastMonth = new Date(today);
    
        lastMonth.setMonth(today.getMonth() - 1);
    
        const year = lastMonth.getFullYear();
        const month = String(lastMonth.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
        const day = String(today.getDate()).padStart(2, '0'); // Mantenemos el día actual
    
        return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    };
    

    useEffect(() => {
        const fetchVariable = async () => {
            let date = getLastMonthDate();
            try {
                const res = await fetch(variableAPI(id, date, date));
                if (res.status === 404) {
                    console.error("Error 404: Data not found");
                    return;
                }
                if (!res.ok) throw new Error('Error fetching data');
                
                const data = await res.json();
                const previousValue = data.results[0]?.valor || 0;
                setValue(previousValue); // Actualiza el valor si la respuesta es correcta
    
                // Calcular diferencia si previousValue no es 0
                if (previousValue !== 0) {
                    const diffPercentage = ((valor - previousValue) / previousValue) * 100;
                    setDifference(diffPercentage.toFixed(2));
                } else {
                    setDifference(0); // Si el valor anterior es 0, no se puede calcular la diferencia
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchVariable();
    }, [id, valor]); // Agregado 'valor' como dependencia para recalcular si cambia

    return(
        <article className="h-[300px] w-[400px] m-auto p-6 rounded-[15px] shadow-xl border-[1px] border-gray-300 bg-white">
            <h2 className="text-xl font-bold mb-2 truncate">{titulo}</h2>
            <h3 className="text-4xl font-extrabold text-gray-800 mb-4">
                {valor.toLocaleString()}
                <span
                    className={`text-base ml-2 flex items-center ${
                        difference > 0
                            ? 'text-green-500'
                            : difference < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                    }`}
                >
                    <DifferenceIcon dif={difference}/>
                    {difference}% en el último mes
                </span>
            </h3>
            <p className="text-gray-600 mb-6 text-base">{desc}</p>
            <span className="text-sm text-gray-500">{fecha}</span>
        </article>
    );
}

export default InfoCard;
