export const categories = {
    inflacion: [27, 28, 29],
    baseMonetaria: [15, 16, 17, 18, 19, 21, 22, 23, 24, 25],
    unidadesFinancieras: [30, 31, 32],
    tasas: [7, 8, 11, 12, 13, 14, 35, 43],
    bcra: [1, 4, 5],
    prestamos: [26],
    otrosIndices: [40, 44, 45, 'riesgo-pais']
}

// Data most relevant to investors for the Dashboard:
// 'riesgo-pais' = Riesgo País
// 27 = Inflación mensual
// 44 = Tasa TAMAR de bancos privados (la tasa de política monetaria, id 160, se discontinuó en 2025)
// 1  = Reservas Internacionales
// 30 = CER
// 15 = Base Monetaria (proxy de liquidez)
export const indexCategories = ['riesgo-pais', 27, 44, 1, 30, 15]
