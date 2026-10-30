# 0005. Puppeteer 25 para que el PDF funcione con Node 26

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto

La versión de npm genera los PDF con el Chrome que Puppeteer descarga al
instalarse. Con Puppeteer 24 y Node 26, la versión LTS desde octubre de 2026,
ese Chrome se descarga entero (190 MB en Windows) pero no se descomprime: la
carpeta queda con tres ficheros, sin `chrome.exe`, y ni npm ni Puppeteer avisan.
Después, cada PDF falla con «No se encontró el ejecutable empaquetado del
navegador», y reinstalar no lo arregla, porque Puppeteer da por buena la
carpeta a medias.

Comprobado el 30-10-2026:

- En Windows 11 con Node 26.13.0 y npm 11.20.0, `npm install -g execonvert`
  (0.7.3) dejó la carpeta del navegador sin `chrome.exe` dos veces seguidas,
  partiendo de una caché vacía.
- En Linux, la misma librería que usa Puppeteer 24 para descomprimir
  (`extract-zip` 2.0.1) descomprime los 30 ficheros de un zip de prueba con
  Node 22.23.4 y se para en el primero con Node 26.13.0, sin dar error.
- Es un fallo conocido: [puppeteer#14957](https://github.com/puppeteer/puppeteer/issues/14957),
  corregido en `@puppeteer/browsers` 3, que descomprime con las herramientas
  del sistema (`unzip`, `tar.exe`) y viene con Puppeteer 25.

Los paquetes nativos no estaban afectados: llevan su propio Node 22 y el Chrome
ya descomprimido.

## Decisión

Usar Puppeteer 25. Pide Node 22.12 o posterior, así que `engines` y la página
de la versión de terminal piden Node.js 22.12. En Puppeteer 25,
`executablePath()` devuelve una promesa y el paquete es solo ESM; eXeConvert ya
lo carga con `import()`.

Validado con el paquete construido de `main`: instalado con npm y Node 26 en
Linux y en Windows, con la caché vacía, Chrome queda completo y el PDF sale a la
primera. Pasan todas las pruebas (`test:runtime` incluida).

## Alternativas descartadas

- **Forzar `@puppeteer/browsers` 3 con `overrides`** y quedarse en Puppeteer 24:
  npm solo aplica los `overrides` del proyecto raíz, no los de un paquete que se
  instala como dependencia o con `-g`, así que no llegaría a quien instala
  eXeConvert.
- **Pedir Node 22 o 24 en la web**: Node 26 es el que instala hoy cualquiera
  que siga las instrucciones de Node, y el fallo no da ninguna pista.

## Consecuencias

- Volver a Puppeteer 24 vuelve a romper el PDF de la versión de npm con Node 26.
- Quien tenga Node 22 anterior a la 22.12 tiene que actualizarlo.
- npm 12 dejará de ejecutar los scripts de instalación que no se autoricen,
  también el de Puppeteer que descarga Chrome (npm 11 ya lo avisa). Habrá que
  decidir entonces cómo se instala Chrome en la versión de npm.
