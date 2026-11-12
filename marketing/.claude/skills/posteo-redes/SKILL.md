---
name: posteo-redes
description: Adapta piezas de Infopeso a cada red social (X, Instagram feed/carrusel/Reels, TikTok, LinkedIn, Threads) y arma el calendario semanal de contenido según los pilares. Usala para planificar la semana, convertir una idea en posteos por red o preparar un carrusel.
---

# Posteo en redes

Leé primero `contexto/pilares-de-contenido.md`, `contenido/calendario.md` y las últimas entradas de `contenido/registro.md`. Para escribir, aplicá la skill `copy-infopeso`.

## Formatos por red

| Red | Formato | Reglas |
| --- | --- | --- |
| **X** (@infopeso) | Tuit ≤ 280 car., hilo 5–7, imagen 1600×900 o video vertical | El dato en la primera línea. Link al final del tuit o en el último del hilo. 0–1 hashtag (#dólar, #CEDEARs) solo si suma búsqueda. |
| **Instagram feed / carrusel** | 1080×1350, 5–8 láminas | Lámina 1 = gancho + número grande. Última = CTA + logo. Caption ≤ 600 car., link «en la bio». |
| **Reels / TikTok / Shorts** | 1080×1920, 6–30 s | Ver `guion-video` y `video-hyperframes`. Dato o gancho visible en el cuadro 0 (miniatura). |
| **LinkedIn** | Texto 600–1.200 car. + imagen o carrusel PDF | Tono un poco más analítico, misma voz. Bueno para transparencia y «cómo construimos Infopeso». |
| **Threads** | Igual que X, más conversacional | Reutilizar preguntas de comunidad. |

## Armar la semana

1. Calculá la mezcla con `contexto/pilares-de-contenido.md` (dato 30 / educativo 30 / producto 20 / comunidad 15 / transparencia 5).
2. Revisá fechas: calendario INDEC (inflación), pagos de bonos, feriados, vacaciones.
3. Proponé una tabla: `fecha · hora (AR) · red · pilar · gancho · CTA · ¿video?`.
4. Horarios por defecto (Argentina): 9:00, 12:30, 18:30, 21:00 en días hábiles; 11:00 y 19:00 fin de semana. Ajustá con lo que muestre `contenido/registro.md`.
5. Guardá el plan en `contenido/calendario.md` (sección de la semana) y cada pieza como borrador en `contenido/borradores/`.

## Carruseles

Lámina 1 gancho · 2–6 una idea por lámina, número grande en Bricolage 800 · penúltima fuente y fecha · última logo + CTA. Para producirlos como imagen, podés usar una composición HyperFrames de 1080×1350 con un cuadro por lámina y `npx hyperframes snapshot --at ...` para exportar PNG.

## Publicación

Vos preparás; **publica o programa el usuario**. Si el usuario pide que lo programes en su navegador, confirmá cada pieza (texto exacto, fecha, hora) antes de tocar «Programar».
