import { useState, useEffect } from 'react';
import InfoCard from '../components/InfoCard';
import { macroAPI } from '../apis';
import { Loading } from '../components/LoadingAnim';

export default function Macro(){
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState('loading');
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await fetch(macroAPI);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setResponse(data.results);
          setStatus('success');
          console.log(data.results);
        } catch (err) {
          console.error(err);
          setStatus('error');
        }
      };
  
      fetchData();
    }, []);
    return(
        <section id="macro" className="pt-[100px]">
            <h1 className="text-4xl text-center text-black font-bold" style={{textShadow: '2px 2px 2px #ddd'}}>Datos de la macroeconomía argentina</h1>
            <div className="info__container grid xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-10 pt-10 xl:w-[1300px] m-auto">
            {status === "loading" && (<Loading/>)}
            {status === 'error' && <h1>Error</h1>}
            {status === 'success' && response && response.map((data, index) => (
            <InfoCard 
              key={index} 
              titulo={data.descripcion.split('(')[0].trim()} 
              valor={data.valor} 
              desc={`(${data.descripcion.split('(')}`} 
              fecha={data.fecha}
              id={data.idVariable}
            />
            ))}
        </div>
        </section>
    )
}