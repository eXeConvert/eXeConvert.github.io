# eXeConvert

Conversor estático en navegador para transformar proyectos `.elpx` de eXeLearning 4 en `.docx`.

## Qué hace ahora

- Lee un `.elpx` directamente en el navegador.
- Descomprime el ZIP en memoria.
- Extrae `content.xml` (formato moderno de eXeLearning 4).
- Reconstruye una versión simplificada de página única.
- Convierte ese HTML a `.docx` con `html-docx-js-typescript`.

## Qué no hace todavía

- No soporta todavía el formato legacy `contentv3.xml`.
- No intenta reproducir toda la lógica visual de `singlepage`; genera una versión textual y estable pensada para DOCX.
- La exportación actual genera un DOCX nativo simplificado para mejorar la compatibilidad con LibreOffice y Word.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3007`.

## Publicación en GitHub Pages

- La app compilada se genera en `docs/`.
- La raíz del repositorio contiene una redirección automática a `./docs/`.
- Tras cada cambio, hay que ejecutar `npm run build` y subir también el contenido de `docs/`.

## Arquitectura

- `src/converter.ts`: parser del `.elpx`, normalización HTML y generación del `.docx`.
- `src/main.ts`: interfaz web estática.

La siguiente iteración razonable es sustituir el parser simplificado por una integración más directa con la lógica de exportación de eXeLearning.
