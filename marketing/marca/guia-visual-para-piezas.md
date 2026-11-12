# Guía visual para piezas de marketing

Traducción del manual Pulso (`../../brand/manual-de-marca.md`) a video, carruseles e imágenes para redes. Los tokens de color son los de `../../brand/tokens/tokens.css`; para video están listos en `marca/pulso-video.css`.

## Lo esencial

- **Oscuro primero:** fondo `#141210` (`ground-000`), tarjetas `#1C1916` (`surface-100`), chips `#2A2622` (`surface-200`), bordes `#332E29` (`line`).
- **Tres tintas:** `#F1ECE4` (ink), `#C4BCB1` (ink-muted), `#9C948A` (ink-subtle). No inventes grises.
- **Un solo acento:** naranja `#FF6A33` (`signal`). Máximo 3 usos no-dato por cuadro. Para subas también es naranja (`up`); las bajas son azul `#6E9BFF` (`down`). **Nunca rojo/verde.**
- **▲ es la marca.** El punto de la «i» es una suba. Usá `assets/isotipo-triangulo.svg` como recurso gráfico (sello, viñeta, transición), pero nunca en lugar del logo.
- **Tipografías:** Bricolage Grotesque 800 para titulares y cifras (tracking negativo), 400 para cuerpo; Geist Mono 500 en mayúsculas para etiquetas (`DÓLAR BLUE · VENTA`, `ACTUALIZADO 18:00`).
- **Sin ruido:** sin sombras, degradés, glassmorphism, ilustraciones, emojis, stock photos de gente sonriendo con billetes.

## Escala tipográfica para video 1080 × 1920 (vertical)

| Uso | Tamaño | Peso | Tracking |
| --- | --- | --- | --- |
| Cifra héroe | 220–280 px | 800 | −0.05em |
| Titular | 96–120 px | 800 | −0.045em |
| Subtítulo | 56–64 px | 700 | −0.02em |
| Cuerpo / subtítulos | 44–52 px | 400–600 | 0 |
| Etiqueta mono | 32–36 px | 500, mayúsculas | 0.06em |

Para 1080 × 1080 multiplicá por ~0,8; para 1920 × 1080 por ~0,85.

## Márgenes seguros (vertical)

- Lateral: 96 px.
- Superior: 220 px libres (interfaz de Reels/TikTok).
- Inferior: 380 px libres (descripción, botones). El logo de cierre va centrado, nunca pegado abajo.

## Movimiento en video

El manual pide transiciones de 150–200 ms `ease-out` en la interfaz. En video se permite un poco más de expresión, sin traicionar la marca:

- Entradas: 0,3–0,6 s, `power3.out` / `expo.out`. **Nada rebota** (sin `back`, `elastic`, `bounce`).
- La cifra héroe **cuenta** hasta su valor (count-up) con `tabular-nums` para que no tiemble.
- El ▲ entra desde abajo y se asienta: es el «latido» de la marca (Pulso).
- Destello de actualización: fondo `surface-200` 0,6 s detrás del número. No hagas parpadear el naranja.
- Cortes secos o deslizamientos cortos. Sin transiciones de PowerPoint (giros, zoom con desenfoque exagerado).

## Estructura tipo de un video corto (6–20 s)

1. **0–1,5 s · Gancho:** pregunta o número gigante.
2. **1,5–N s · Desarrollo:** 1 a 3 beats, una idea por pantalla.
3. **Penúltimo · Fuente y hora:** etiqueta mono `FUENTE: DOLARAPI · 06/11 18:00`.
4. **Último 1,5–2 s · Cierre:** logo principal sobre oscuro + `infopeso.com.ar` en mono. Si hay análisis: «No es recomendación de inversión.»

## Logos

Usá los SVG de `../../brand/logos/svg/` (copias en cada proyecto de video, carpeta `assets/`). Nunca escribas «infopeso» en texto como si fuera el logo. Sobre video o fotos: `logo-mono-crema.svg`. Resguardo: altura del ▲ en los cuatro lados. Ancho mínimo en video vertical: 360 px.

## Audio

Música instrumental sobria (electrónica suave, minimal, tempo medio). Sin voces cantadas. Sonidos cortos tipo «tick» para el count-up y un golpe suave para el ▲. Obtenela con `/media-use` y anotá la licencia en el borrador.
