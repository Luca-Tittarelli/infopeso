---
name: video-hyperframes
description: Produce y edita videos de Infopeso con HyperFrames (HTML + GSAP → MP4) respetando la estética Pulso - parte de la plantilla de marca, aplica tokens, tipografías y logos, verifica con check/snapshot y renderiza. Usala para cualquier video, motion graphic, reel, intro, carrusel animado o edición de video de Infopeso. Complementa las skills oficiales /hyperframes, /hyperframes-cli, /hyperframes-registry y /media-use.
---

# Video con HyperFrames (Infopeso)

HyperFrames compone videos como HTML: elementos con `class="clip"` y `data-start` / `data-duration` / `data-track-index`, y una timeline GSAP **pausada** registrada en `window.__timelines["<composition-id>"]`. El CLI previsualiza, chequea y renderiza a MP4. Requiere Node 22+ y FFmpeg (ya instalados en esta máquina).

**Leé primero la skill oficial `/hyperframes`** (contrato de render y ciclo de trabajo) si está instalada. Si no lo está, decile al usuario que corra `npx hyperframes skills update` desde `marketing/` (instalar skills es paso del usuario) y mientras tanto seguí esta guía y `npx hyperframes docs <tema>`.

## Flujo

1. **Guion** con la skill `guion-video` (tabla de escenas aprobada o al menos clara).
2. **Proyecto nuevo** copiando la plantilla:
   ```bash
   cp -r videos/_plantilla-dato videos/AAAA-MM-DD-slug
   ```
   (PowerShell: `Copy-Item -Recurse videos/_plantilla-dato videos/AAAA-MM-DD-slug`). Actualizá `meta.json` (`id`, `name`) y `package.json` (`name`).
   Para otro formato: cambiá `data-resolution`, el `viewport`, `width/height` de `html, body` y `data-width/height` del root (1080×1080 cuadrado, 1080×1350 carrusel, 1920×1080 horizontal).
3. **Componer** en `index.html`:
   - Estilos solo con variables de `assets/pulso-video.css` (copia de `marca/pulso-video.css`) y clases `.v-hero .v-title .v-sub .v-body .v-label`. Ningún hex suelto.
   - Logos de `assets/` (SVG). Nunca el logo como texto.
   - Antes de construir algo a mano (gráfico, mapa, lower-third, count-up), buscá en el registro: `npx hyperframes catalog` / skill `/hyperframes-registry`, y adaptalo a los tokens.
   - Audio y música: skill `/media-use` (o las herramientas de música/SFX del host si existen). Anotá la licencia en el borrador.
4. **Verificar** (siempre, antes de mostrar o renderizar):
   ```bash
   cd videos/AAAA-MM-DD-slug
   npx --yes hyperframes@0.9.19 check
   npx --yes hyperframes@0.9.19 snapshot --at 0,1.5,4,8
   ```
   Mirá el `contact-sheet.jpg` que genera snapshot. Corregí errores y warnings de *Craft* (cuadro 0 vacío, línea final muy corta, texto ilegible). Los avisos `nested_structure_needs_subcomposition` son aceptables en piezas simples; para piezas largas, separá escenas en sub-composiciones (`data-composition-src`).
5. **Preview para el usuario:** `npx --yes hyperframes@0.9.19 preview --background` → verificá con `preview --status` → al terminar `preview --stop`. No uses `npm run dev` desde un agente.
6. **Render:** `npx --yes hyperframes@0.9.19 render -o renders/<slug>.mp4` (unos 20 s para 10 s de video). Los MP4 y `renders/` están en `.gitignore`.
7. **Revisión** con `revision-marca` y registro en el borrador.

`publish` sube el proyecto a una URL de HyperFrames: es publicar, pedí OK explícito antes.

## Reglas de marca en movimiento (resumen de `marca/guia-visual-para-piezas.md`)

- Fondo `--ground-000`; naranja solo en ▲, subas y como máximo un acento más por cuadro.
- Subas `--up` con ▲ y «+»; bajas `--down` con ▼ y «−». **Nunca rojo/verde.**
- Eases `power3.out` / `expo.out`, entradas 0,3–0,6 s. Prohibido `back`, `elastic`, `bounce`.
- Cifras con `tabular-nums`. El cuadro 0 muestra el dato real (miniatura honesta), nunca un valor intermedio de un count-up.
- Márgenes seguros verticales: 96 px laterales, 220 px arriba, 380 px abajo.
- Cierre: logo principal + `infopeso.com.ar` en mono, ≥ 2 s en pantalla. Aviso si hay análisis.

## Errores comunes

- Timeline no pausada o no registrada → el render sale congelado. Siempre `gsap.timeline({ paused: true })` + `window.__timelines["main"] = tl`.
- Animaciones con `setTimeout`, `requestAnimationFrame` o CSS `animation` sin adaptador → no son seekables; todo por la timeline.
- Contenido generado al azar (`Math.random`) → cada cuadro distinto. Usá valores fijos.
- Fuentes que no cargan → usá `display=block` en el link de Google Fonts (ya está en la plantilla).
- `z-index` negativo → queda detrás del fondo del root.
