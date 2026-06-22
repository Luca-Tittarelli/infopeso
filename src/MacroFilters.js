export const categories = {
    inflacion: [27, 28, 29],
    baseMonetaria: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    unidadesFinancieras: [30, 31, 32],
    tasas: [6, 7, 8, 9, 10, 11, 12, 13, 14, 34, 35, 41, 43],
    bcra: [1, 4, 5, 42],
    prestamos: [26],
    otrosIndices: [40, 44, 45, 'riesgo-pais']
}

// Data most relevant to investors for the Dashboard:
// 'riesgo-pais' = Riesgo País
// 27 = Inflación mensual
// 6  = Tasa Política Monetaria
// 1  = Reservas Internacionales
// 32 = CER
// 15 = Base Monetaria (proxy de liquidez)
export const indexCategories = ['riesgo-pais', 27, 6, 1, 32, 15]