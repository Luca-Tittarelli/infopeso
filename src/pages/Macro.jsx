import { useState, useEffect } from 'react';
import InfoCard from '../components/InfoCard';
import { macroAPI } from '../apis';

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
            <div className="info__container grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-10 pt-10">
            {status === 'loading' && <h1>Loading...</h1>}
            {status === 'error' && <h1>Error</h1>}
            {status === 'success' && response && response.map((data, index) => (
            <InfoCard 
              key={index} 
              titulo={data.descripcion.split('(')[0].trim()} 
              valor={data.valor} 
              desc={`(${data.descripcion.split('(')}`} 
              fecha={data.fecha}
            />
            ))}
        </div>
        </section>
    )
}