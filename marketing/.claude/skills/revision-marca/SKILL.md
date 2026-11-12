---
name: revision-marca
description: Revisa una pieza de marketing de Infopeso antes de entregarla o publicarla - voz y tono, compliance (no recomendación), veracidad de datos y fuentes, formato es-AR, funciones que existen, y estética Pulso en piezas visuales. Devuelve aprobado o una lista de cambios concretos. Usala siempre al final de cualquier pieza.
---

# Revisión de marca

Revisá la pieza contra cada punto. Respondé con:

```
VEREDICTO: APROBADO | CAMBIOS
- [bloqueante] … → cambio exacto propuesto
- [mejora] … → cambio exacto propuesto
```

Bloqueante = compliance, dato falso o sin fuente, función inexistente, error de marca visible (rojo/verde, logo en texto, emojis). Mejora = todo lo demás.

## Compliance (`contexto/compliance.md`)
- [ ] No recomienda comprar/vender/mantener, ni sugiere «oportunidad», «momento de entrar».
- [ ] No promete rendimientos ni predice precios.
- [ ] Tiene el aviso si hay análisis, empresas puntuales o bonos.
- [ ] No hay testimonios ni cifras de usuarios inventadas; no usa logos de brokers.

## Datos (`contexto/fuentes-de-datos.md`)
- [ ] Cada cifra coincide con «Datos usados» del borrador (verificá contra el JSON; si podés, re-ejecutá `node herramientas/datos.mjs`).
- [ ] Tiene tipo (venta/compra/cierre), fuente y fecha/hora.
- [ ] Formato es-AR: `$ 1.234,50`, `US$`, `+2,15 %`, `−0,80 %` con menos real, `939 pb`, espacio antes del %.

## Producto (`contexto/producto.md`)
- [ ] Solo menciona funciones que existen hoy. Nada de Premium, pagos, alertas, PDF, rendimiento real, calendario de dividendos.
- [ ] Las URLs existen y tienen las mayúsculas correctas (`/Cartera`, `/Cambios`, `/Economia`, `/RentaFija`, `/Empresas`, `/guias`).

## Voz (`contexto/voz-y-tono.md`)
- [ ] Voseo en todo el texto. Frases cortas, número primero.
- [ ] Sin emojis, sin «!!!», sin hype, sin muletillas de IA.
- [ ] CTA único con verbo concreto.
- [ ] Respeta el límite de caracteres de la red.

## Visual (si aplica — `marca/guia-visual-para-piezas.md`)
- [ ] Logo desde SVG, con resguardo y tamaño mínimo; nunca escrito.
- [ ] Solo tokens Pulso; naranja ≤ 3 usos no-dato por cuadro; subas naranja ▲, bajas azul ▼.
- [ ] Bricolage Grotesque + Geist Mono, cifras tabulares.
- [ ] Sin sombras, degradés, ilustraciones, stock photos.
- [ ] Video: cuadro 0 con contenido real, márgenes seguros, cierre ≥ 2 s, `hyperframes check` sin errores. Mirá el contact sheet del snapshot.
