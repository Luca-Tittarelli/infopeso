import { useState, useEffect } from "react";
import { dolarAPI } from "../apis";

export default function Cambios(){
    const [response, setResponse] = useState(null);
    const [status, setStatus] = useState('loading');
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await fetch(dolarAPI);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setResponse(data);
          setStatus('success');
        } catch (err) {
          console.error(err);
          setStatus('error');
        }
      };
      
      fetchData();
    }, []);
    console.log(response);

    return(
      <section className="min-h-screen flex items-center justify-center bg-gray-100 pt-[100px]">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cambios del Dólar</h1>

        {status === "loading" && (
          <div className="flex items-center justify-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
          </div>
        )}

        {status === "error" && (
          <p className="text-red-500 text-center">Error al cargar los datos.</p>
        )}

        {status === "success" && response && (
          <div className="space-y-4">
            {response.map((item, key) => (
              <div key={key} className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-gray-900 text-xl">{item.nombre}</h3>
                <div className="flex justify-between text-center">
                  <span className="font-bold">
                    Compra
                    <p>{item.compra}</p>
                  </span>
                  <span className="font-bold">
                    Venta
                    <p>{item.venta}</p>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    )
}