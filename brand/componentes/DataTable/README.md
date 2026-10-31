# DataTable

Tabla de especies para el panel de acciones, bonos, CEDEARs y las posiciones de la Cartera.

- La primera columna lleva el ticker en Bricolage Grotesque 700 de 15 px, con el nombre debajo en `ink-subtle` a 12 px.
- Las columnas numéricas van en Geist Mono 400 de 14 px con `tabular-nums`, alineadas a la derecha, en formato es-AR.
- Los encabezados usan el estilo `label` en `ink-subtle` y respetan la misma alineación que su columna. Usá `<th scope="col">`.
- La columna de variación usa el componente Delta sin fondo. Las columnas secundarias, como volumen o nominales, van en `ink-muted`.
- Las filas tienen padding `space-3` × `space-4`, se separan con un divisor de 1 px `line` y en hover pasan a fondo `surface-200`. No uses filas cebra.
- La tabla va dentro de un contenedor `surface-100` con borde `line` y radio `radius-md`, que se desplaza en horizontal en pantallas angostas (`overflow-x: auto`). La tabla nunca se encoge.
- Si una celda no tiene dato, muestra `—`.
- La columna activa para ordenar se marca con ▲/▼ en el encabezado. No uses otros íconos.
