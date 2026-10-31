# Infopeso — Marca (identidad Pulso)

Todo el material de marca de Infopeso en un solo lugar. Empezá por `manual-de-marca.md`: es la fuente de verdad para personas y agentes.

```
infopeso-brand/
├── README.md                 ← este índice
├── manual-de-marca.md        ← manual completo: principios, logo, color, tipografía, datos, voz, checklist
├── logos/
│   ├── svg/                  ← logos vectoriales (usar estos en web y en código)
│   ├── png/                  ← exportaciones para redes, app y favicon
│   └── generar-logos.py      ← script que genera los SVG desde Bricolage Grotesque 800
├── tokens/
│   ├── tokens.json           ← colores (tema oscuro y claro), tipografía, espaciado y radios
│   └── tokens.css            ← los mismos tokens como variables CSS, listos para importar
└── componentes/
    ├── Button/               ← README.md (reglas) + preview.html (referencia visual)
    ├── Delta/
    ├── QuoteCard/
    └── DataTable/
```

## Uso rápido en código

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/brand/tokens.css">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon-180.png">
```

- El tema oscuro es el predeterminado (`:root`). Para el claro, poné `data-theme="light"` en `<html>`.
- Las variables CSS son `--ground-000`, `--surface-100`, `--ink`, `--signal`, `--up`, `--down`, `--space-6`, `--radius-md`, `--font-display`, `--font-mono`, etc.
- Las clases tipográficas son `.display-xl`, `.display`, `.figure`, `.h1`, `.h2`, `.body`, `.body-sm`, `.label` y `.data`.
- Si cambiás `tokens.json`, regenerá `tokens.css` en lugar de editarlo a mano.

## Logos

| Archivo | Uso |
| --- | --- |
| `logo-principal-sobre-oscuro` | Uso preferente, sobre fondos oscuros |
| `logo-principal-sobre-claro` | Sobre fondos claros |
| `logo-mono-tinta` | Una tinta oscura: sobre naranja e impresión |
| `logo-mono-crema` | Una tinta clara: sobre fotos o video |
| `simbolo-i-sobre-oscuro` / `-claro` | La «i» con su ▲, cuando no entra el logo completo |
| `isotipo-triangulo` | El ▲ solo, como recurso gráfico |
| `icono-app` (PNG 1024 / 512 / 192, apple-touch 180) | App, PWA, avatar |
| `favicon` (SVG, PNG 32 / 16) | Pestaña del navegador |

Tipografías: Bricolage Grotesque y Geist Mono, ambas con licencia SIL Open Font License, gratuitas para uso comercial.

## Versiones en línea

- Canvas de diseño con los conceptos, logos, reglas y aplicaciones: https://claude.ai/artifact/J4K4WfFpDHB9d1eiiEVY4u
- Sistema de diseño «Infopeso Pulso» (manual, tokens y componentes navegables): https://claude.ai/artifact/8vJXFnVZp9vi2iYbJ6rL2y

Ambos enlaces son privados hasta que se compartan desde el menú Compartir.
