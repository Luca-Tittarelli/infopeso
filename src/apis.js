export const macroAPI = 'https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables'
export const variableAPI = (id, desde, hasta)=>{ return `https://api.bcra.gob.ar/estadisticas/v2.0/DatosVariable/${id}/${desde}/${hasta}`}
export const dolarAPI = 'https://dolarapi.com/v1/dolares'
export const dolarHistoricoAPI = 'https://api.argentinadatos.com/v1/cotizaciones/dolares/'
export const cotizacionesAPI = 'https://dolarapi.com/v1/cotizaciones'
export const RiesgoPaisHistoricoAPI = 'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais'
export const RiesgoPaisAPI = 'https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo'