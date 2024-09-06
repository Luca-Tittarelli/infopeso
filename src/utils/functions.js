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
