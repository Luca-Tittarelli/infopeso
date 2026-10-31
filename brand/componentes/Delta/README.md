# Delta

La variación de un valor, marcada con el triángulo de la marca: ▲ naranja cuando sube y ▼ azul cuando baja.

- **Suba:** triángulo sólido en `up`, texto en `signal-text` con signo `+`.
- **Baja:** triángulo invertido en `down`, texto en `down` con signo `−` (el carácter U+2212, no un guion).
- **Sin cambio:** solo el texto en `ink-subtle` con `=`, sin triángulo.
- La tipografía es Geist Mono 500 de 14 px con `tabular-nums`. El triángulo mide 10 × 9 px y se separa del número `space-1`.
- La variante pastilla, con fondo `surface-200` y radio `radius-pill`, se usa en tarjetas y encabezados. En tablas va sin fondo.
- El formato es el de es-AR: `+2,15 %`, con un espacio antes del %. El riesgo país va en puntos básicos: `+35 pb`.
- Cada delta lleva un `aria-label` en palabras, por ejemplo «sube 2,15 por ciento».
- Nunca uses rojo o verde, ni flechas en lugar de triángulos, y no pongas el número en naranja sin el ▲.
