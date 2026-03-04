# elpx-docx

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
- La librería HTML a DOCX usa `altChunk`, así que la compatibilidad es mejor en Microsoft Word que en LibreOffice o Google Docs.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3007`.

## Arquitectura

- `src/converter.ts`: parser del `.elpx`, normalización HTML y generación del `.docx`.
- `src/main.ts`: interfaz web estática.

La siguiente iteración razonable es sustituir el parser simplificado por una integración más directa con la lógica de exportación de eXeLearning.
