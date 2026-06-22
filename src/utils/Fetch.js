export const fetchData = async (url) => {
    let status = '';
    let responseData = null; // Cambiado el nombre de la variable
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error en la respuesta');
      responseData = await res.json();
      status = 'success';
    } catch (err) {
      console.error(err);
      status = 'error';
      responseData = ''
    }
    return { data: responseData, status: status };
};
