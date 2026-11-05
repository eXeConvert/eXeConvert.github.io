# 0007. Importar PDF con el conversor de EdiMarkdown

- **Estado:** aceptada; sustituida en parte por el [ADR 0008](0008-importar-pdf-tambien-en-la-version-de-terminal.md), que lleva el PDF también a la versión de terminal
- **Fecha:** 2026-11-05

## Contexto

eXeLearning no abre ni importa PDF: solo `.elpx`, `.elp`, `.zip` y `.epub`
(comprobado en el código de la 4.0.6). En el grupo de Telegram de eXeLearning
se preguntó cómo crear un proyecto a partir de un PDF o de una presentación.

EdiMarkdown, del mismo autor, ya convierte PDF a Markdown en el navegador: un
diálogo con las opciones (páginas, quitar encabezados y pies repetidos,
conservar imágenes, OCR de las páginas escaneadas) y una vista previa, un
worker que ejecuta PyMuPDF4LLM sobre Pyodide y un guion de Python que limpia
el resultado (tablas, notas al pie, fórmulas detectadas como imagen). Está
probado con documentos reales y con su propia batería de pruebas de
navegador. eXeConvert, a su vez, ya convierte Markdown en un proyecto `.elpx`.

## Decisión

La web de eXeConvert acepta `.pdf` y lo convierte con el conversor de
EdiMarkdown, copiado tal cual:

- `scripts/sync-pdf-import.mjs` trae de EdiMarkdown (su rama `main` en GitHub,
  una etiqueta o una copia local) `pdf-import.js`, `pdf-worker.js`,
  `pdf-import.py`, `markup-safety.js` y `vendor/pdf-runtime/` a
  `app/public/pdf/`, sin cambiar una línea; comprueba el motor contra el
  SHA-256 de su manifiesto y anota versión y commit en
  `app/public/pdf/source.json`. Los textos `pdf_*` del diálogo, en sus cinco
  idiomas, y la versión van a `src/pdf-import-data.json`.
- `src/pdf-import.ts` carga el diálogo solo al abrir un PDF, le da lo que
  espera encontrar en la página de EdiMarkdown (`marked` para su vista previa,
  las dos funciones que componen allí las notas y Tesseract.js) y cambia los
  tres rótulos que hablan de abrir una pestaña nueva («Convertir», «Crear el
  proyecto»).
- El Markdown resultante sigue el camino de la importación de Markdown, con
  HTML permitido porque el conversor escribe `<sup>` y `<br>`, y con las
  mismas opciones de estructura de páginas. Las imágenes, que llegan como
  archivos aparte, pasan a `data:` para que el paso común las lleve a
  `content/resources` (ADR 0002).
- Las notas al pie (`[^n]`) se escriben como en la importación de LaTeX:
  número volado en el texto y la nota al final de la sección que la cita,
  antes del encabezado siguiente, que puede abrir otra página. En un
  encabezado la llamada se quita, porque pasaría al título de la página.
- El diálogo se abre una vez por archivo: cambiar después la estructura de
  páginas reutiliza su resultado. Para cambiar páginas, imágenes u OCR se
  vuelve a abrir el PDF.
- Tesseract.js (y los datos de su idioma) se descarga de jsDelivr solo si se
  marca el OCR, con la misma versión y la misma huella SRI que EdiMarkdown. El
  aviso de privacidad lo dice.
- Solo en la web. La CLI y los instaladores no importan PDF: `build-cli.mjs`
  deja fuera `app/public/pdf/` (unos 34 MB) y `tsconfig.cli.build.json`, el
  módulo `src/pdf-import.ts`.

Para que el diálogo se pueda copiar entero, EdiMarkdown sacó su limpieza de
Markdown (`stripUnsafeMarkup`) a `markup-safety.js`, sin dependencias
(commit `6809bfa` de EdiMarkdown).

## Alternativas descartadas

- **Pasar primero por EdiMarkdown y después importar el `.md`.** Funciona sin
  programar nada, pero son dos herramientas y dos pasos para una sola tarea.
- **Cargar el diálogo desde `edimarkdown.github.io`.** Un worker tiene que
  servirse desde el mismo origen que la página que lo crea, y la web
  dependería de otra en cada uso.
- **Reescribir la conversión en eXeConvert.** Serían dos conversores que se
  irían separando; el de EdiMarkdown ya resuelve tablas, notas al pie,
  encabezados repetidos y OCR, con su propia batería de pruebas.
- **Llevarlo también a la CLI.** Pyodide funciona en Node, pero es otro
  trabajo y otros 34 MB en cada paquete; queda para más adelante.

## Consecuencias

- Cada mejora del conversor de PDF se hace en EdiMarkdown y llega aquí con
  `npm run sync:pdf`, seguido de `npm run test:pdf` y de una prueba en
  Chromium y Firefox con un PDF con imágenes, tablas y páginas escaneadas.
  Los archivos de `app/public/pdf/` no se editan a mano.
  Un servidor de desarrollo (`npm run dev`) que ya estuviera en marcha no
  sirve los archivos nuevos hasta que se reinicia: devuelve `index.html` en su
  lugar y el diálogo no carga.
- Lo que EdiMarkdown no reconoce tampoco llega aquí: por ejemplo, una tabla
  sin líneas verticales sale como párrafos.
- La web sirve unos 34 MB más, que el navegador solo descarga al abrir un
  PDF (la primera vez; luego, de su caché). En Firefox la primera conversión
  tarda unos 20 s más que en Chromium.
- Si EdiMarkdown cambia lo que el diálogo espera de la página (otra función
  global, otra firma de `importPdf`), `src/pdf-import.ts` tiene que seguirle.
