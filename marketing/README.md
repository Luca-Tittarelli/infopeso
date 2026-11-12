# Estudio de marketing de Infopeso

Entorno para que Claude Code trabaje como equipo de marketing de Infopeso: conoce el producto, la marca Pulso y la voz; escribe copy, planifica redes y produce videos con [HyperFrames](https://hyperframes.heygen.com).

## Cómo usarlo

Abrí Claude Code **en esta carpeta** (`infopeso/marketing`). Así carga `CLAUDE.md`, las skills y los subagentes de `.claude/`.

Pedidos de ejemplo:

- «Armá el dato del día con video.»
- «Planificá la semana del 9 al 15 de noviembre para X e Instagram.»
- «Escribí un hilo explicando MEP vs CCL vs blue.»
- «Hacé un reel de 20 s mostrando cómo importar el CSV de Cocos.»
- «Revisá este borrador antes de publicarlo.»

## Instalación (una vez)

Requisitos: Node 22+ y FFmpeg (ya están en esta máquina).

Skills oficiales de HyperFrames, instaladas en este proyecto (recomendado):

```bash
npx hyperframes skills update
```

O como plugin de Claude Code, para todos tus proyectos:

```bash
claude plugin marketplace add heygen-com/hyperframes
```

```bash
claude plugin install hyperframes@hyperframes
```

Abrí una sesión nueva después de instalar para que carguen.

## Qué hay

```
marketing/
├── CLAUDE.md                  ← instrucciones del agente (rol, reglas, flujo)
├── .claude/
│   ├── agents/                ← copywriter, estratega-contenido, editor-video, revisor-marca
│   ├── skills/                ← copy-infopeso, posteo-redes, dato-del-dia, guion-video,
│   │                             video-hyperframes, revision-marca
│   └── settings.json          ← permisos para HyperFrames y la herramienta de datos
├── contexto/                  ← producto, audiencia, voz y tono, compliance, pilares,
│                                 competencia, fuentes de datos
├── marca/                     ← guía visual para piezas + tokens para video (pulso-video.css)
│                                 La fuente de verdad sigue siendo ../brand/
├── herramientas/datos.mjs     ← trae dólar, riesgo país e inflación reales en formato es-AR
├── contenido/                 ← calendario, registro de lo publicado, plantilla, borradores
└── videos/
    └── _plantilla-dato/       ← proyecto HyperFrames de marca (1080×1920, 10 s)
```

## Comandos útiles

```bash
node herramientas/datos.mjs
```

```bash
cd videos/_plantilla-dato && npx --yes hyperframes@0.9.19 preview
```

```bash
cd videos/_plantilla-dato && npx --yes hyperframes@0.9.19 render
```

## Reglas

Claude prepara borradores; **publicar, programar o enviar es tuyo** (o con tu OK explícito por pieza). Nada de recomendaciones de inversión, cifras inventadas ni funciones que todavía no existen.
