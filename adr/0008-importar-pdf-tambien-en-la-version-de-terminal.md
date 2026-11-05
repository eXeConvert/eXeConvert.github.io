# 0008. Importar PDF también en la versión de terminal

- **Estado:** aceptada
- **Fecha:** 2026-11-05
- **Sustituye en parte a:** [ADR 0007](0007-importar-pdf-con-el-conversor-de-edimarkdown.md),
  en lo que dejaba la importación de PDF solo para la web.

## Contexto

La 0.8.0 importó PDF solo en la web (ADR 0007) como primer paso; la versión
de terminal y sus instaladores quedaban sin PDF. eXeConvert es la misma
herramienta en las dos formas, y lo que hace una tiene que hacerlo la otra.

El conversor de EdiMarkdown corre en el navegador sobre Pyodide, que también
funciona en Node, y su OCR es Tesseract.js, que también tiene versión para
Node.

## Decisión

La versión de terminal convierte `.pdf` a `.elpx` con el mismo conversor y el
mismo motor que la web, ya copiados en `app/public/pdf/`:

- `cli/pdf-node.ts` hace lo que en la web hace `pdf-worker.js`: carga Pyodide,
  las mismas piezas en el mismo orden, aplica el mismo retoque a
  `pymupdf4llm` y ejecuta `pdf-import.py`. `tests/pdf-cli.test.mjs` comprueba
  que el retoque y las piezas siguen siendo los del worker.
- Pyodide se carga como CommonJS. eXeConvert es un paquete de módulos ES, y
  con esa marca Node leía `pyodide.asm.js` como módulo y fallaba en su
  `require`. `sync-pdf-import.mjs` escribe un `package.json` con
  `"type": "commonjs"` junto al motor; no es ninguna de las piezas del
  manifiesto y el navegador no lo mira.
- El OCR usa Tesseract.js 7.0.0 (dependencia del paquete) con los mismos datos
  de idioma que la web, que se descargan de jsDelivr la primera vez y se
  guardan en la caché del usuario (`execonvert/tesseract`). Qué texto se queda
  en cada página lo decide `ocrPageMarkdown`, la función de EdiMarkdown, que
  para esto pasó a exportarse (commit `78c5e4c` de EdiMarkdown).
- Tesseract.js decide al cargarse si está en un navegador mirando si existe
  `document`, y la CLI pone uno (linkedom, `cli/runtime.ts`) para otras
  conversiones. Mientras se carga, `document` se retira.
- Las opciones del diálogo pasan a parámetros: `--pages` (que en un `.elpx`
  ya elegía páginas) dice qué páginas del PDF se convierten, `--keep-headers`
  conserva los encabezados y pies repetidos, `--no-images` deja fuera las
  imágenes, y `--ocr` y `--ocr-lang` (de partida, el idioma de `--lang`)
  aplican el OCR. Sin `--ocr`, si hay páginas sin texto se avisa.
- El resultado sigue el mismo camino que en la web (`src/pdf-markdown.ts`),
  así que un PDF da el mismo proyecto en las dos.

## Alternativas descartadas

- **Dejar el PDF solo en la web.** La herramienta quedaba incompleta en la
  forma que se usa para automatizar.
- **Instalar el OCR aparte, solo al pedirlo.** Los instaladores llevan su
  propio Node, sin npm, y descargar a mano Tesseract.js y sus dependencias
  sería un mecanismo propio y frágil. Va dentro.
- **Usar PyMuPDF nativo o Tesseract del sistema.** Exigiría Python o
  Tesseract instalados en el equipo y daría resultados distintos de la web.

## Consecuencias

- El paquete de npm y los instaladores llevan el motor (unos 34 MB) y
  Tesseract.js con su núcleo (unos 51 MB sin comprimir).
- La primera conversión con OCR de cada idioma necesita conexión para bajar
  sus datos.
- Las pruebas de `tests/pdf-cli.test.mjs` se ejecutan en GitHub en Linux,
  Windows y macOS, OCR incluido.
- Un cambio en `pdf-worker.js` de EdiMarkdown (otras piezas, otro retoque)
  hace fallar esa prueba hasta que `cli/pdf-node.ts` lo siga.
