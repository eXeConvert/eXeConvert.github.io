# 0002. Imágenes importadas como archivos del proyecto, reducidas a 1920 px

- **Estado:** aceptada
- **Fecha:** 2026-10-29

## Contexto

Los importadores (`.docx`, `.md`, `.html` y `.tex`) leen cada imagen como una
URL `data:` y así llegaba al `.elpx`: incrustada en `content.xml` y otra vez en
las páginas de vista previa del paquete, con un tercio más de peso que el
archivo y al tamaño original. Al pasar a eXeLearning una página de Google Sites
sacada con Google Takeout, que entrega las fotos originales, el `.elpx` pesó
16,5 MB: dos fotos de 5760 × 3840 y 600 × 400 px.

eXeLearning guarda las imágenes como archivos en `content/resources/<carpeta>/`
y las enlaza con `{{context_path}}/<carpeta>/<archivo>`. Su columna de
contenido es mucho más estrecha que 1920 px, también en pantallas de alta
densidad.

## Decisión

1. **Un solo paso para todos los importadores**, en `convertProjectToElpx`
   (`src/import-images.ts`). Los importadores siguen dando URL `data:` y este
   paso las convierte en archivos de `content/resources/<carpeta>/imagen-N.<ext>`,
   con una carpeta por importación y el nombre de carpeta que usa eXeLearning
   (fecha y seis letras). La misma imagen repetida es un solo archivo. Las
   páginas `index.html` y `html/*.html` del paquete apuntan a esos archivos.
2. **Reducción al tamaño en que se ve.** JPEG, PNG y WebP con el lado largo
   mayor de 1920 px se reducen a 1920 px (Lanczos), con los criterios del
   preajuste por defecto de
   [elpx-optimizer](https://github.com/ateeducacion/elpx-optimizer/blob/main/docs/profiles.md),
   la herramienta del Área de Tecnología Educativa de Canarias para aligerar
   proyectos `.elpx`: JPEG y WebP con calidad 82; PNG sin pérdida, con OxiPNG.
   El resultado solo se queda si pesa menos que el original. Las imágenes
   pequeñas no se tocan, para no perder calidad al recomprimir.
3. **Lo que se estropearía, intacto:** GIF y PNG o WebP animados, SVG, JPEG en
   CMYK, PNG de 16 bits y cualquier imagen que no se pueda descodificar. La
   orientación EXIF de un JPEG se aplica a los píxeles, porque el archivo nuevo
   no lleva EXIF.
4. **Los mismos códecs en la web y en la CLI**: jSquash, en WebAssembly, el
   mismo motor que usa elpx-optimizer en el navegador. La CLI los carga con el
   `fetch` de archivos locales y el `ImageData` de `cli/runtime.ts`.

## Alternativas descartadas

- **Dejar las URL `data:`.** Es lo que había; ver el contexto.
- **Archivos sin reducir.** Quita el tercio de la codificación y la copia de la
  vista previa, pero la página de prueba se quedaba en unos 7 MB: la foto de
  cámara sola pesa 4,7 MB.
- **Recomendar elpx-optimizer después.** Funciona, pero es un paso más que el
  profesorado no suele dar, y eXeConvert ya sabe en qué se van a ver.
- **`<canvas>` en la web y `sharp` en la CLI.** Sin dependencias en el
  navegador, pero con dos motores que dan resultados distintos, y `sharp` lleva
  binarios nativos que complican los paquetes `.deb`, AppImage, `.exe` y `.pkg`.
- **Un ajuste para elegir el límite o desactivarlo.** No se ha pedido; si hace
  falta, se añade aquí.

## Consecuencias

- La página de prueba de Google Sites pasa de 16,5 MB a 2,4 MB, casi todo la
  plantilla de eXeLearning, en unos 7 segundos tanto en la web como en la CLI.
  La foto de 5760 × 3840 px y 4,7 MB queda en 1920 × 1280 px y 76 KB.
- eXeLearning 4.0.5 abre el proyecto y, al exportarlo como sitio web y SCORM
  1.2, las páginas encuentran sus imágenes (comprobado con su CLI,
  `elp:export`).
- Comprobado con fotos de prueba: una foto con orientación EXIF 6 sale girada
  (1280 × 1920 px), una WebP se reduce y una JPEG en CMYK se deja igual.
- La web publica unos 2 MB más de WebAssembly, pero solo descarga los códecs
  del formato que reduce, y solo cuando hay una imagen mayor de 1920 px: para
  una JPEG, unos 450 KB.
- Si eXeLearning cambia cómo guarda sus recursos, hay que revisar
  `src/import-images.ts`.
