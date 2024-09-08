import { useState, useEffect } from 'react';
import { MacroCard } from '../components/macro/InfoCard';
import { macroAPI } from '../apis';
import { Loading } from '../components/LoadingAnim';
import { fetchData } from '../utils/Fetch';

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
          <h1 className="text-4xl text-center text-black font-bold py-8" style={{textShadow: '2px 2px 2px #eee'}}>Datos de la macroeconomía argentina</h1>



          <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
            {status === "loading" && (<Loading/>)}
            {status === 'error' && <h1>Error</h1>}
            {status === 'success' && response && response.map((data, index) => (
            <MacroCard 
              key={index} 
              titulo={data.descripcion.split('(')[0].trim()} 
              valor={data.valor} 
              desc={data.descripcion.replace(/[()]/g, '')} 
              fecha={data.fecha}
              id={data.idVariable}
            />
            ))}
          </div>
        </section>
    )
}