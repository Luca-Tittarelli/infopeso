# Fuentes de datos

Las mismas que usa el sitio. Para obtener los datos del día, corré:

```bash
node herramientas/datos.mjs          # resumen legible en es-AR
node herramientas/datos.mjs --json   # JSON para usar en un video o script
```

| Dato | Fuente | Endpoint | Cómo citar |
| --- | --- | --- | --- |
| Dólar oficial, blue, MEP (bolsa), CCL, tarjeta, mayorista, cripto | DolarAPI | `https://dolarapi.com/v1/dolares` | «Fuente: DolarAPI» + hora de `fechaActualizacion` |
| Otras monedas (euro, real) | DolarAPI | `https://dolarapi.com/v1/cotizaciones` | «Fuente: DolarAPI» |
| Riesgo país | ArgentinaDatos | `https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo` | «Fuente: ArgentinaDatos (EMBI)» |
| Inflación mensual (IPC) | ArgentinaDatos (dato INDEC) | `https://api.argentinadatos.com/v1/finanzas/indices/inflacion` | «Fuente: INDEC» + mes del dato |
| Históricos del dólar | ArgentinaDatos | `https://api.argentinadatos.com/v1/cotizaciones/dolares/{casa}` | «Fuente: ArgentinaDatos» |
| Variables monetarias (reservas, base, tasa) | BCRA | `https://api.bcra.gob.ar/estadisticas/v4.0/monetarias` | «Fuente: BCRA» |
| Acciones y CEDEARs en vivo | data912 | `https://data912.com/live/...` | «Fuente: BYMA vía data912 (diferido)» |

## Reglas

- Cada cifra publicada lleva **fecha y hora** de actualización y su **tipo** (compra, venta, cierre).
- Para el dólar, usá el precio de **venta** salvo que la pieza diga otra cosa.
- Brecha = (blue o MEP / oficial − 1) × 100, con un decimal.
- Si una API falla o el dato tiene más de un día hábil de antigüedad, decilo o no publiques el dato.
- Guardá en el borrador el JSON crudo que usaste (sección «Datos usados») para poder verificar después.
