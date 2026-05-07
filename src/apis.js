export const macroAPI = 'https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias'
export const variableAPI = (id, desde, hasta)=>{ return `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias/${id}?desde=${desde}&hasta=${hasta}`}
export const dolarAPI = 'https://dolarapi.com/v1/dolares'
export const dolarHistoricoAPI = 'https://api.argentinadatos.com/v1/cotizaciones/dolares/'
export const dolarFechaAPI = (casa, fecha)=> `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}/${fecha}`
export const cotizacionesAPI = 'https://dolarapi.com/v1/cotizaciones'
export const RiesgoPaisHistoricoAPI = 'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais'
export const RiesgoPaisAPI = 'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo'

// World Bank API endpoints para PBI (Argentina)
export const PBIApi = 'https://api.worldbank.org/v2/country/AR/indicator/NY.GDP.MKTP.CD?format=json'
export const PBIGrowthApi = 'https://api.worldbank.org/v2/country/AR/indicator/NY.GDP.MKTP.KD.ZG?format=json'
export const PBIIndustryApi = 'https://api.worldbank.org/v2/country/AR/indicator/NV.IND.TOTL.ZS?format=json'
export const PBIAgricultureApi = 'https://api.worldbank.org/v2/country/AR/indicator/NV.AGR.TOTL.ZS?format=json'
export const PBIServicesApi = 'https://api.worldbank.org/v2/country/AR/indicator/NV.SRV.TOTL.ZS?format=json'
export const PBIManufacturingApi = 'https://api.worldbank.org/v2/country/AR/indicator/NV.IND.MANF.ZS?format=json'