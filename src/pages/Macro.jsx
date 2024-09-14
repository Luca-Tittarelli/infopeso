import { useState, useEffect } from 'react';
import { MacroCard } from '../components/macro/MacroInfoCard';
import { macroAPI } from '../apis';
import { Loading } from '../components/LoadingAnim';
import { fetchData } from '../utils/Fetch';
import { ErrorComponent } from '../components/Error';

export default function Macro(){
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState('loading');
    
    useEffect(() => {
      const fetching = async () => {
        const res = await fetchData(macroAPI)
        setResponse(res.data.results)
        setStatus(res.status)
        console.log(res)
      };fetching();
    }, []);

    
    return(
        <section id="macro" className="pt-[100px]">
          <h2 className="text-4xl text-center text-black dark:text-zinc-300 font-bold py-8">Datos de la macroeconomía argentina</h2>
          {status === "loading" && (<Loading/>)}
          {status === 'error' && <ErrorComponent message={"Error al obtener la información"}/>}
          <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
            {status === 'success' && response && response.map((data, index) => (
            <MacroCard 
              key={index} 
              titulo={data.descripcion.split('(')[0].trim()} 
              valor={data.valor} 
              desc={data.descripcion.split('(')[1]?.replace(/[()]/g, '')} 
              fecha={data.fecha}
              id={data.idVariable}
            />
            ))}
          </div>
        </section>
    )
}