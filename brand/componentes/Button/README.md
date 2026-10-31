# Button

Botón de acción en forma de pastilla, en tres variantes: primario, secundario y fantasma.

- **Primario** (`signal` de fondo, texto `on-signal`): la acción principal de la pantalla. Hay uno solo por vista.
- **Secundario** (contorno de 1,5 px `ink-subtle`, texto `ink`): acciones alternativas, como «Ver detalle».
- **Fantasma** (sin fondo, texto `ink-muted`, hover `surface-200`): cancelar, cerrar y acciones de baja prioridad.
- El botón mide 48 px de alto (44 px como mínimo en mobile), con padding horizontal `space-6`, radio `radius-pill` y texto en Bricolage Grotesque 700 de 16 px.
- El texto es un verbo que dice qué pasa: «Crear mi cartera», «Agregar posición». No uses «Click acá» ni «Enviar».
- Cuando está deshabilitado, el fondo pasa a `surface-200` y el texto a `ink-subtle`. Durante la carga, el texto cambia a gerundio («Guardando…»).
- El foco se marca con un anillo de 2 px `focus` con 2 px de separación.
- No lleva íconos decorativos. Solo se admite una flecha → al final en enlaces que llevan a otra sección.
