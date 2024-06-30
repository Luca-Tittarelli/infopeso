import React, { useState, useEffect } from 'react';
import InfoCard from './components/InfoCard';
import Header from './components/Header';

function App() {
  const [response, setResponse] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables');
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

  return (
    <>
      <Header />
      <div className="info__container grid xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-10 py-[100px]">
        {status === 'loading' && <h1>Loading...</h1>}
        {status === 'error' && <h1>Error</h1>}
        {status === 'success' && response && response.map((data, index) => (
          <InfoCard key={index} titulo="Hola" valor={data.valor} desc={data.descripcion} />
        ))}
      </div>
    </>
  );
}

export default App;
