---
name: dato-del-dia
description: Produce la pieza «Dato del día» de Infopeso con cifras reales (dólar blue/MEP/CCL/oficial/tarjeta, brecha, riesgo país, inflación) - trae los datos con herramientas/datos.mjs, elige el dato más relevante y genera el posteo para X/Instagram y, si se pide, el video vertical con la plantilla HyperFrames. Usala cuando pidan el dato del día, el cierre del dólar o una pieza con números de hoy.
---

# Dato del día

## 1. Traer los datos

```bash
node herramientas/datos.mjs          # para leer
node herramientas/datos.mjs --json   # para copiar valores al borrador o al video
```

Si hay errores de fuente o el dato es viejo (más de un día hábil), avisá y no publiques ese dato.

## 2. Elegir el dato

Criterio, en orden:
1. ¿Hubo un movimiento grande? (variación diaria o brecha que cambió > 1 punto respecto de ayer — compará con `contenido/registro.md` o con `https://api.argentinadatos.com/v1/cotizaciones/dolares/{casa}`).
2. ¿Hay un dato oficial nuevo hoy? (inflación del INDEC, riesgo país en un nivel redondo).
3. Si no pasó nada: rotá entre blue, MEP, brecha y riesgo país según lo que menos se usó en la semana.

Un dato protagonista + hasta 3 de contexto. Nada de opinión sobre si conviene comprar.

## 3. Escribir (skill `copy-infopeso`)

Plantilla de X:

```
[Nombre del dato]: [cifra] ([tipo]).
[▲/▼] [variación con signo] [contra qué].
[contexto 1] · [contexto 2]

Fuente: [fuente] · [dd/mm hh:mm]
```

Variación: `+2,15 %` / `−0,80 %` con el signo menos real. Nula: `= 0,00 %` sin triángulo.

## 4. Video (opcional, skill `video-hyperframes`)

Copiá `videos/_plantilla-dato` a `videos/AAAA-MM-DD-dato-<slug>/` y editá solo el objeto `DATO` en `index.html` con los valores del JSON. Después `npm run check`, snapshot y render según la skill.

## 5. Guardar

Borrador en `contenido/borradores/AAAA-MM-DD-dato-<slug>.md` con la plantilla `contenido/plantilla-pieza.md`, incluyendo el JSON crudo en «Datos usados». Pasá `revision-marca` antes de entregar.
