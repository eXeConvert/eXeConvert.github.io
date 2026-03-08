# eXeConvert

Conversor estático en navegador para transformar proyectos de eXeLearning y convertir entre `.elp`, `.elpx`, `.docx`, `.md` y `.pdf` sin salir del navegador.

## Qué hace ahora

- Lee directamente en el navegador archivos `.elp`, `.elpx`, `.docx` y `.md`.
- Convierte proyectos legacy `.elp` a `.elpx` usando el pipeline de importación/exportación de eXeLearning.
- Analiza `content.xml` de proyectos `.elpx` modernos y permite seleccionar páginas antes de exportar.
- Reconstruye una versión HTML estable del contenido para previsualización y exportación.
- Exporta `.elpx` a `.docx`, `.md` o `.pdf`.
- Importa `.docx` y `.md` a `.elpx`.

## Qué no hace todavía

- No intenta reproducir toda la lógica visual de `singlepage`; genera una versión estable orientada a exportación y previsualización.
- La exportación a `.docx` genera un documento nativo simplificado, priorizando compatibilidad con LibreOffice y Word frente a la fidelidad visual absoluta.
- La conversión depende de la estructura semántica disponible en el proyecto o documento de origen; algunos iDevices, estilos complejos o comportamientos interactivos pueden degradarse a una representación más simple.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3007`.

## Publicación en GitHub Pages

- La app compilada se genera en `docs/`.
- El despliegue en `https://execonvert.github.io/` se hace con GitHub Actions.
- Cada `push` a `main` recompila la app y publica el contenido de `docs/` como sitio de GitHub Pages.
- En local puedes seguir usando `npm run build` para comprobar el resultado antes de subir cambios.

## Arquitectura

- `src/converter.ts`: parser del `.elpx`, selección de páginas, normalización HTML y exportación a `.docx` y `.pdf`.
- `src/legacy-elp.ts`: conversión de `.elp` legacy a `.elpx` mediante bundles de eXeLearning.
- `src/docx-import.ts`: importación de `.docx` a `.elpx`.
- `src/markdown-import.ts` y `src/elpx-markdown.ts`: conversiones entre `.md` y `.elpx`.
- `src/main.ts`: interfaz web estática.

La siguiente iteración razonable es sustituir el parser simplificado por una integración más directa con la lógica de exportación de eXeLearning.
