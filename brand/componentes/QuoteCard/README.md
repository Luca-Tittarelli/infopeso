# QuoteCard

Tarjeta que muestra una cotización o un indicador (dólar MEP, CCL, blue, oficial, riesgo país, inflación) con su variación y su hora de actualización.

- **Estructura**, de arriba hacia abajo: la etiqueta (estilo `label`, en `ink-subtle`), el valor (estilo `figure`, en `ink`) y una fila con el Delta en pastilla a la izquierda y la hora a la derecha.
- La etiqueta dice qué dato es y de qué tipo: «DÓLAR MEP · VENTA», «DÓLAR BLUE · COMPRA».
- El valor lleva unidad (`$`, `US$`, `%`, `pb`). Si la unidad va después del número, va en `ink-muted` y a la mitad del tamaño.
- La tarjeta usa fondo `surface-100`, borde de 1 px `line`, radio `radius-md` y padding `space-6`.
- En grilla, el ancho mínimo es de 220 px y el gap `space-4`. En mobile se apilan, o van en un carrusel horizontal si son más de cuatro.
- Si no hay dato, el valor muestra `—` y se oculta el delta. Nunca muestres `0` como reemplazo.
- Cuando el valor se actualiza en vivo, la tarjeta hace un destello de fondo `surface-200` durante 600 ms.
- Una sola tarjeta por pantalla puede destacarse con fondo `signal` y texto `on-signal`, siempre en la versión grande de la home.
