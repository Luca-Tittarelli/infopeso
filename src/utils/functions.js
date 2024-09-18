export const getLastMonthDate = () => {
    const today = new Date();
    const lastMonth = new Date(today);

    lastMonth.setMonth(today.getMonth() - 1);

    // Si al ajustar el mes, el día resulta inválido, JavaScript ajusta el mes y día automáticamente.
    // Ahora necesitamos asegurar que el día no exceda los días disponibles en el mes anterior.
    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0');
    const day = String(lastMonth.getDate()).padStart(2, '0'); // Corregido para obtener el día válido del mes pasado

    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};
export const getYesterdayDate = () => {
    const today = new Date();
    today.setDate(today.getDate() - 1); // Restamos un día a la fecha actual

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
    const day = String(today.getDate()).padStart(2, '0'); // Día de ayer

    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};

export const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0'); 

    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};
export const getDatesRange = ()=>{
    const today = new Date();
    
    // Obtener la misma fecha del mes pasado
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    // Asegurar que la fecha sea válida (por ejemplo, manejar meses con menos días)
    if (lastMonth.getMonth() === today.getMonth() - 1 || (today.getMonth() === 0 && lastMonth.getMonth() === 11)) {
        const validDay = Math.min(today.getDate(), new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate());
        lastMonth.setDate(validDay);
    }
    
    // Obtener fecha 4 días después de la fecha anterior
    const fourDaysLater = new Date(lastMonth);
    fourDaysLater.setDate(lastMonth.getDate() + 4);

    return [lastMonth, fourDaysLater].map(date => date.toISOString().split('T')[0]); // Formato YYYY-MM-DD
}

export const getTimeDifference = (fechaActualizacion)=>{
    const ahora = new Date();
    const diferencia = ahora - new Date(fechaActualizacion); // Diferencia en milisegundos
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    // Comprobaciones para saber el tiempo que pasó desde la ultima actualizacion del valor
    if (dias === 1) return `Actualizado hace 1 día`;
    if (dias > 1) return `Actualizado hace ${dias} días`;
    if (horas === 1) return `Actualizado hace 1 hora`;
    if (horas > 1) return `Actualizado hace ${horas} horas`;
    if (minutos === 1) return `Actualizado hace 1 minuto`;
    if (minutos > 1) return `Actualizado hace ${minutos} minutos`;
    if (segundos === 1) return `Actualizado hace 1 segundo`;
    return `Actualizado hace ${segundos} segundos`;
}