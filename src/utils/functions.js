export const getLastMonthDate = () => {
    const today = new Date();
    const lastMonth = new Date(today);

    lastMonth.setMonth(today.getMonth() - 1);

    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
    const day = String(today.getDate()).padStart(2, '0'); // Mantenemos el día actual

    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};
export const getLastDayDate = () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0); // Primer día del mes actual menos un mes

    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0'); // Meses empiezan desde 0
    const day = String(lastMonth.getDate()).padStart(2, '0'); // Día del último día del mes anterior

    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};
export const diferenciaTiempo = (fechaActualizacion)=>{
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