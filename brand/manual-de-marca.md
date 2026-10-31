# Infopeso Pulso

Manual de marca y sistema de diseño de **Infopeso** (infopeso.com.ar), un dashboard financiero argentino: dólar, inflación, mercado y una Cartera personal. Este documento es la fuente de verdad para cualquier persona o agente que diseñe o programe el rediseño. Si algo no está acá, se resuelve con el criterio de la sección «Principios» y nunca inventando un estilo nuevo.

> **Para agentes:** leé este README completo antes de tocar código. Usá siempre los tokens (`var(--signal)`, `var(--space-6)`…) en lugar de valores sueltos, y los archivos de logo de `assets/Logos/` en lugar de recrear la marca con texto. Al final hay una checklist para revisar tu trabajo antes de entregarlo.

## La idea

**El punto de la «i» es una suba.** El logotipo reemplaza el punto de la «i» por un triángulo naranja ▲, el mismo signo con el que la interfaz marca una variación positiva. Logo, indicadores e íconos comparten un único símbolo: cada vez que alguien ve un ▲ naranja en la interfaz, ve la marca.

Personalidad: **enérgica, expresiva, precisa**. Una fintech con voz propia que le habla a un público inversor serio sin sonar a banco. Lo expresivo está en la tipografía grande y en el naranja; la precisión está en los datos, que siempre son claros, alineados y verificables.

## Principios

1. **Los números son protagonistas.** La cifra importante va grande, en Bricolage Grotesque, y todo lo demás se subordina a ella.
2. **Un solo acento.** El naranja (`signal`) aparece en el ▲, en la acción principal de cada pantalla y en las subas. Si en una pantalla hay más de tres usos de naranja que no son datos, sobra alguno.
3. **Oscuro primero.** El tema oscuro es la cara de la marca. El claro existe para lectura larga, impresión y preferencia del usuario.
4. **Sin ruido.** Sin sombras, degradés, glassmorphism, ilustraciones ni emojis. La jerarquía se construye con tamaño, peso, espacio y los tres niveles de tinta.
5. **Dato verificable.** Cada cifra muestra su unidad, su fuente o tipo (venta, compra, cierre) y la hora de actualización.

## Logo

Los archivos están en `assets/Logos/`. Son SVG vectorizados desde Bricolage Grotesque 800: **nunca escribas el logo como texto** ni lo redibujes.

| Archivo | Cuándo usarlo |
| --- | --- |
| `logo-principal-sobre-oscuro.svg` | Uso preferente: encabezados, portada, piezas sobre `ground-000` oscuro. Letras `#F1ECE4`, ▲ `#FF6A33`. |
| `logo-principal-sobre-claro.svg` | Sobre fondos claros. Letras `#141210`, ▲ `#D9461A`. |
| `logo-mono-tinta.svg` | Una sola tinta oscura: sobre naranja `signal`, documentos en blanco y negro. |
| `logo-mono-crema.svg` | Una sola tinta clara: sobre fotos o video oscuros. |
| `simbolo-i-sobre-oscuro.svg` / `simbolo-i-sobre-claro.svg` | La «i» con su ▲, cuando el logo completo no entra (avatares, encabezados angostos). |
| `isotipo-triangulo.svg` | El ▲ solo, como sello o recurso gráfico. Nunca como reemplazo del logo en el encabezado. |
| `icono-app.svg` | Ícono de app y PWA: cuadrado naranja con radio del 22,5 %, «i» en tinta. |
| `favicon.svg` | Favicon y tamaños menores a 24 px: fondo tinta, «i» crema y ▲ naranja. |

**Construcción.** El ▲ va centrado sobre el asta de la «i», mide 1,3 veces el ancho del asta y se separa de ella 0,14 veces la altura x.

**Área de resguardo.** Dejá libre alrededor del logo un espacio igual a la altura del ▲ en los cuatro lados.

**Tamaño mínimo.** Logo completo: 96 px de ancho en pantalla y 25 mm impreso. Símbolo «i»: 24 px de alto. Por debajo de eso, usá `favicon.svg`.

**No:** cambiar el color del ▲, estirar, rotar, agregar sombras, brillos o degradés, ubicarlo sobre fondos de bajo contraste, ni escribir «infopeso» con una «i» común como si fuera el logo.

En el encabezado web, el logo mide entre 120 y 140 px de ancho y enlaza a la home.

## Color

Los valores exactos están en `tokens.json`. La regla de proporciones es aproximadamente **70 % fondos y superficies, 25 % tintas, 5 % naranja**.

- `ground-000` es el fondo de página; `surface-100` se usa para tarjetas; `surface-200` para chips, hover y campos.
- `ink`, `ink-muted` e `ink-subtle` son los únicos tres niveles de texto. No crees grises intermedios.
- `signal` va en rellenos y en texto de 24 px o más. Para texto naranja más chico se usa `signal-text`, que cumple 4.5:1.
- **Subas y bajas:** `up` (naranja) con ▲ y signo +; `down` (azul) con ▼ y signo −. **No uses rojo y verde.** El par naranja/azul se distingue también por luminosidad, y el símbolo y el signo garantizan que se lea sin color. Una variación nula se muestra en `ink-subtle` con «=» y sin triángulo.
- `on-signal` para todo lo que va encima de un botón o bloque naranja.

## Tipografía

Ambas familias están en Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Bricolage Grotesque** se usa para todo lo que se lee: titulares, cuerpo, botones y cifras destacadas. Los titulares van en 800 con tracking negativo (ver los estilos `display-xl`, `display`, `h1`), y el cuerpo en 400. Dejá activo el eje óptico (`font-optical-sizing: auto`).
- **Geist Mono** se usa para datos tabulares y etiquetas. Las etiquetas van en mayúsculas en el estilo `label`, y las celdas numéricas en el estilo `data`, alineadas a la derecha.
- En toda cifra que pueda cambiar o compararse usá `font-variant-numeric: tabular-nums`.
- Nunca uses más de dos pesos de Bricolage en el mismo bloque.

## Formato de datos (Argentina)

- Los miles se separan con punto y los decimales con coma: `1.234,50`. Usá `Intl.NumberFormat('es-AR')`.
- Moneda: `$ 1.234,50` para pesos y `US$ 1.234,50` para dólares. Va un espacio entre símbolo y número.
- Porcentaje: `+2,15 %` y `−0,80 %`, siempre con signo y con un espacio antes del %. Para el negativo usá el signo menos real «−».
- Riesgo país en puntos básicos: `1.234 pb`.
- La hora de actualización va en `ink-subtle` con el estilo `label`: `ACTUALIZADO 14:32`. Si el dato es diferido, decilo.
- Si no hay dato, mostrá `—`. Nunca muestres `0`, `NaN` ni un valor inventado.

## Espaciado, radios y layout

- La grilla es de 4 px. Usá solo los tokens `space-*`.
- Ancho máximo de contenido: 1280 px. Margen lateral de `space-12` en desktop y `space-4` en mobile.
- Las tarjetas llevan padding `space-6`, se separan entre sí con `space-8` y usan radio `radius-md` (o `radius-lg` si son grandes).
- Los botones y las etiquetas de estado son siempre pastilla (`radius-pill`).
- Separá elementos con espacio o con un borde de 1 px `line`. No uses sombras.
- Mobile primero. Las tablas anchas se desplazan en horizontal dentro de su contenedor, y la navegación inferior en mobile tiene cuatro pestañas como máximo.

## Iconografía

- Los íconos son de línea, con trazo de 1,75 px, esquinas redondeadas y un tamaño de 20 o 24 px. Usá [Lucide](https://lucide.dev) y mantené ese único set.
- Los íconos van en `ink` o `ink-muted`. Solo el ▲ y la acción principal pueden ir en naranja.
- El ▲ y el ▼ de variación son triángulos sólidos, no flechas.

## Voz y tono

Hablamos como un amigo que sabe de finanzas: directo, en voseo rioplatense y sin jerga innecesaria.

- **Sí:** «¿Tu plata le ganó a la inflación?», «Cargá tu cartera», «Actualizado hace 2 minutos», «El MEP subió 2,15 % hoy».
- **No:** «¡Maximizá tus ganancias! 🚀», «Invertí ya», «Oportunidad única», ni promesas de rendimiento.
- Los botones dicen qué pasa al tocarlos: «Crear mi cartera», «Ver detalle», «Agregar posición».
- Infopeso informa y no recomienda inversiones. Donde haya análisis, incluí el aviso: «Información con fines informativos. No es una recomendación de inversión».

## Movimiento

- Las transiciones son cortas, de 150 a 200 ms con `ease-out`. Nada rebota.
- Cuando un valor se actualiza en vivo, el número hace un destello breve de fondo `surface-200` durante 600 ms. No hagas parpadear el naranja.
- Respetá `prefers-reduced-motion`.

## Accesibilidad

- El texto debe tener un contraste mínimo de 4.5:1, y 3:1 a partir de 24 px y en bordes de controles. Todos los pares de tokens de este sistema ya cumplen con esto.
- Las áreas táctiles miden 44 × 44 px como mínimo.
- El foco es visible siempre: anillo de 2 px `focus` con 2 px de separación.
- Las variaciones no dependen solo del color: llevan ▲/▼, signo, y en tablas un `aria-label` como «sube 2,15 por ciento».

## Componentes

Los componentes de este sistema son la referencia visual de las piezas que más se repiten:

- **Button**: primario (naranja), secundario (contorno) y fantasma.
- **Delta**: la variación con ▲/▼, el corazón del sistema.
- **QuoteCard**: la tarjeta de cotización (dólar, riesgo país, inflación).
- **DataTable**: tabla de especies del panel y de la Cartera.

Cada componente tiene su propio README con reglas de uso.

## Checklist para agentes

Antes de entregar una pantalla, verificá:

- [ ] El logo sale de `assets/Logos/` y respeta resguardo y tamaño mínimo.
- [ ] Todos los colores, espacios y radios son tokens. No queda ningún hex suelto en los componentes.
- [ ] Hay una sola acción principal naranja por pantalla.
- [ ] Las subas y bajas usan `up`/`down` con ▲/▼ y signo. No hay rojo ni verde.
- [ ] Los números siguen el formato es-AR, son tabulares y muestran unidad y hora de actualización.
- [ ] No hay sombras, degradés, emojis ni ilustraciones.
- [ ] Se ve bien en 360 px de ancho y en tema claro.
- [ ] Los textos están en voseo, son directos y no prometen rendimientos.
