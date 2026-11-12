---
name: guion-video
description: Escribe guiones de videos cortos verticales de Infopeso (Reels, TikTok, Shorts, video para X) - gancho, beats con duración, texto en pantalla, locución opcional, indicaciones visuales con la estética Pulso y fuente/aviso. Usala antes de producir cualquier video y cuando pidan una idea o guion de reel.
---

# Guion de video

Leé `contexto/voz-y-tono.md`, `contexto/compliance.md` y `marca/guia-visual-para-piezas.md`.

## Narrativa (antes de escribir la tabla)

Basado en las referencias `story.md`, `film.md` y `types/explainer.md` de la skill oficial `/hyperframes`. Si está instalada, leelas; si no, están en `github.com/heygen-com/hyperframes/tree/main/skills/hyperframes/references`.

1. **Una sola idea**, escrita como la diría el espectador al terminar («lo de afuera fue el empujón, el problema venía de antes»). Si son dos ideas, son dos videos.
2. **Arrancá desde el espectador:** una situación que vive («abriste el broker y estaba todo para abajo») y la pregunta que se haría. El dato o el diagrama entra después, como respuesta.
3. **Un hilo y un objeto que lo lleva:** un ejemplo concreto o un objeto (el ▼, una cifra) que viaja del gancho al cierre. Nada de recorrer datos sueltos.
4. **Tres líneas narrativas antes de elegir una**, cada una con su recurso y su forma (toma continua, cadena de objetos, un cuadro que se reacomoda…). Recomendá una con el motivo en una línea y mostralas al usuario antes de producir.
5. **No derivar afirmaciones que la fuente no hace.** Compará los números antes de escribir una frase como «acá pega más» o «el doble».
6. **Presupuesto de palabras:** la voz sintética lee unas 2,2 palabras por segundo. Hasta 19 palabras por escena (dos escenas pueden llegar a 26) y hasta unas 155 en total para 30–90 s. Si sobra locución, se recorta el texto, nunca se estira la animación.
7. **Cada parte aparece cuando la voz la nombra**, no todo al principio de la escena. La pantalla nunca repite la frase hablada palabra por palabra, y lleva subtítulos (mucha gente mira sin sonido).

## Reglas de formato

- 6–30 s. Por defecto: dato 8–10 s, educativo 20–30 s, producto 15–25 s.
- **Cuadro 0 = miniatura:** el gancho o el número ya visible, nunca un fondo vacío ni un número a medio contar.
- Una idea por pantalla, **máx. 6–7 palabras** de texto en pantalla, mínimo 1,2 s por pantalla (+0,3 s por palabra).
- Siempre: pantalla de fuente y hora si hay datos; cierre con logo 2–3 s; aviso si hay análisis.
- Sin caras de stock, sin emojis, sin efectos de transición llamativos.
- Si hay locución: voseo, ritmo de 2,5 palabras por segundo, la voz no lee lo mismo que el texto en pantalla (lo complementa).

## Tabla de guion (entregable)

```markdown
**Título:** …   **Red:** Reels/TikTok/X   **Duración:** 18 s   **Pilar:** educativo
**Idea en una frase:** …
**CTA:** …

| # | Tiempo | Texto en pantalla | Locución (opcional) | Visual / movimiento (Pulso) |
|---|--------|-------------------|---------------------|-----------------------------|
| 1 | 0–2 s | «Mismo dólar, cuatro precios» | — | Titular Bricolage 800, ▲ late arriba |
| 2 | 2–5 s | «Oficial $ 1.570» | «El del banco…» | Fila entra desde abajo, cifra en mono |
| … | | | | |
| n−1 | | «FUENTE: DOLARAPI · 06/11 18:00» | — | Etiqueta mono ink-subtle |
| n | | logo + infopeso.com.ar | — | Cierre de la plantilla |

**Audio:** música instrumental sobria, «tick» en cifras. **Aviso:** sí/no.
```

## Ideas de formatos recurrentes

- **Dato del día** (plantilla lista): número + contexto + fuente.
- **En 20 segundos:** un concepto (MEP, CCL, CEDEAR, TIR, P/E, riesgo país).
- **Mismo X, distinto Y:** comparación en filas.
- **Así se hace en Infopeso:** grabación de pantalla del sitio (importar CSV → cartera en dólares) con zoom y etiquetas. Usá `npx hyperframes capture` o una grabación que dé el usuario.
- **La semana en 10 s:** dólar, riesgo país y Merval, variación semanal con ▲/▼.

Entregá el guion en el borrador de la pieza; la producción sigue con `video-hyperframes`.
