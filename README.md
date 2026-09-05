# eXeConvert

Conversor estático en navegador para transformar proyectos de eXeLearning y convertir entre `.elp`, `.elpx`, `.docx`, `.md` y `.pdf` sin salir del navegador.

## Qué hace ahora

- Lee directamente en el navegador archivos `.elp`, `.elpx`, `.docx` y `.md`.
- Convierte proyectos legacy `.elp` a `.elpx` usando el pipeline de importación/exportación de eXeLearning.
- Analiza `content.xml` de proyectos `.elpx` modernos y permite seleccionar páginas antes de exportar.
- Reconstruye una versión HTML estable del contenido para previsualización y exportación.
- Exporta `.elpx` a `.docx`, `.md` o `.pdf`.
- En CLI y paquetes nativos, la exportación `.pdf` usa Puppeteer con navegador embebido y MathJax en SVG para mantener fórmulas vectoriales.
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

## CLI

También hay una interfaz de línea de comandos para automatizar conversiones desde terminal o desde otros programas.

En desarrollo:

```bash
npm run cli -- archivo-entrada archivo-salida
npm run cli -- inspect archivo.elpx
```

Para generar la CLI distribuible:

```bash
npm run build:cli
```

Instalación para usuarios técnicos:

```bash
npm install -g execonvert
```

o sin instalar globalmente:

```bash
npx execonvert archivo-entrada archivo-salida
```

El comando instalado siempre es `execonvert`.

Distribución para usuarios normales:

- Linux Debian/Ubuntu/MX: paquete `.deb`
- Linux genérico: `AppImage`
- Windows: instalador `.exe`
- macOS: instalador `.pkg`

Esos paquetes se generan en GitHub Actions y se adjuntan a cada release de GitHub.

Ejemplos:

```bash
npm run cli -- apuntes.md apuntes.elpx --h1 resource-title --h2 subpage --h3 idevice
npm run cli -- proyecto.elpx proyecto.docx
npm run cli -- legacy.elp legacy.elpx
npm run cli -- legacy.elp legacy.pdf
npm run cli -- proyecto.elpx resumen.md --pages 1,2.1
npm run cli -- inspect proyecto.elpx --json
```

Opciones principales:

- `inspect <archivo.elpx>`: muestra la estructura de páginas.
- `--json`: salida pensada para scripts.
- `--pages 1,2.1`: exporta solo esas páginas de un `.elpx`.
- `--page-id <id>` / `--page-ids a,b,c`: selección por IDs internos.
- `--h1`, `--h2`, `--h3`, `--h4`: controlan cómo se interpreta la estructura al importar `.docx` o `.md` a `.elpx`.

Valores admitidos para la estructura de importación:

- `--h1`: `page` | `resource-title`
- `--h2`, `--h3`, `--h4`: `idevice` | `subpage`

Estado actual de la CLI:

- soportado: `.md/.txt -> .elpx`
- soportado: `.docx -> .elpx`
- soportado: `.elpx -> .md`
- soportado: `.elpx -> .docx`
- soportado: `.elpx -> .pdf`
- soportado: `.elp -> .elpx`
- soportado: `.elp -> .md`
- soportado: `.elp -> .docx`
- soportado: `.elp -> .pdf`

## Actualizaciones de la CLI

La CLI comprueba nuevas versiones estables de **eXeConvert** en GitHub como
máximo una vez al día cuando se usa en una terminal interactiva. El aviso sale
por `stderr`. No comprueba automáticamente en tuberías, CI, con `--json`, ni al
pedir ayuda o la versión. Los errores de red no afectan a las conversiones y
la consulta se cancela cuando termina la operación.

```bash
execonvert update --check                 # Consultar sin descargar
execonvert update --check --json          # Resultado estructurado
execonvert update                        # Actualizar npm o descargar el instalador
execonvert update --out-dir ./descargas   # Elegir carpeta para instaladores
```

- **npm:** instala la versión estable anunciada en GitHub usando npm, en el
  ámbito global o en el proyecto local donde está instalada esta copia. En un
  proyecto local, npm puede actualizar `package.json` y el archivo de bloqueo.
  Si npm todavía no tiene esa versión o faltan permisos, muestra el error.
- **Debian, Windows y macOS:** descarga el instalador de su canal y arquitectura
  y muestra dónde está para instalarlo mediante el sistema. No pide privilegios
  ni ejecuta automáticamente el instalador.
- **AppImage:** descarga la nueva versión, le da permiso de ejecución y conserva
  la anterior. Hay que usar el nuevo archivo o actualizar el enlace habitual.
- **Repositorio de desarrollo:** muestra la versión disponible; la actualización
  del código se hace mediante Git y una nueva compilación.

Las descargas de instaladores comprueban tamaño y SHA-256 antes de guardarse con
su nombre definitivo. Si la publicación aún no tiene un instalador compatible,
se muestra un aviso. Las nuevas publicaciones identifican la arquitectura en
los paquetes de macOS y Windows. Los antiguos `.pkg` sin arquitectura explícita
se descargan manualmente desde la página de versiones.

Por defecto, los instaladores se guardan en la caché del usuario, bajo
`execonvert/downloads/<versión>`. El estado de la consulta diaria se guarda en
`execonvert/update-check.json` dentro de `$XDG_CACHE_HOME` o `~/.cache` en Linux,
`~/Library/Caches` en macOS y `%LOCALAPPDATA%` en Windows.

Para desactivar las consultas automáticas en una ejecución:

```bash
execonvert proyecto.elpx proyecto.md --no-update-check
```

Para desactivarlas de forma persistente, configura la variable de entorno
`EXECONVERT_NO_UPDATE_CHECK=1`. La consulta explícita `update --check` sigue
funcionando. La consulta solo solicita metadatos públicos de versiones;
no envía los documentos del usuario.

## Compatibilidad con nuevas versiones de eXeLearning

El comando `update` conserva la combinación de eXeConvert y eXeLearning probada
en cada publicación. Los componentes de eXeLearning se actualizan en el
repositorio mediante `npm run sync:exe`.

El workflow **Check eXeLearning compatibility** comprueba cada lunes a las
06:25 UTC si hay una versión estable nueva; también se puede lanzar manualmente.
Cuando la encuentra, sincroniza los componentes, comprueba los tipos, ejecuta
las pruebas del actualizador, compila web y CLI y prueba las conversiones.
Si todo pasa, adjunta un artefacto `tested-exelearning-update` con un parche
binario y la procedencia del runtime. El parche se revisa y aplica con
`git apply exelearning-update.patch` sobre la revisión usada por el workflow.
No hace push, no crea releases y no publica cambios automáticamente.

Las pruebas usan un `.elp` sintético con dos páginas, una imagen, fórmulas LaTeX
y contenido en español. Comprueban `.elp → .elpx`, las exportaciones a Markdown,
DOCX y PDF, la reimportación de Markdown/DOCX y la vista previa web en Chromium.
Para ejecutarlas localmente:

```bash
npm run test:updates
npm run build:all
npm run test:cli
npm run test:runtime
```

El workflow **Test CLI and conversions** ejecuta las pruebas del actualizador
en Linux, Windows y macOS; las conversiones y el navegador se comprueban en Linux.

## Organización del código

La web y la CLI están separadas como dos frontends distintos sobre el mismo núcleo de conversión:

- `app/`: entrada y configuración de la aplicación web.
- `src/`: lógica compartida de conversión.
- `cli/`: entrada y runtime específico de la CLI.
- `bin/`: lanzador ejecutable de la CLI.

Comprobaciones:

```bash
npm run check:web
npm run check:cli
npm run build
npm run build:cli
```

La separación no exige cambios en GitHub Pages. El despliegue web sigue dependiendo de `vite.config.ts` y del contenido generado en `docs/`.

## Publicación en GitHub Pages

- La app compilada se genera en `docs/`.
- El despliegue en `https://execonvert.github.io/` se hace con GitHub Actions.
- Cada `push` a `main` recompila la app y publica el contenido de `docs/` como sitio de GitHub Pages.
- En local puedes seguir usando `npm run build` para comprobar el resultado antes de subir cambios.

## Publicación de la CLI

- La CLI distribuible se compila en `dist/cli/`.
- El ejecutable expuesto al usuario es siempre `execonvert`.
- `npm pack` genera un paquete instalable que conserva ese comando.
- El workflow de releases puede adjuntar ese `.tgz` a una release de GitHub para que otros usuarios lo descarguen e instalen con:

```bash
npm install -g ./execonvert-<version>.tgz
```

## Paquetes nativos

Además del paquete npm, el repositorio incluye workflows para generar instaladores autocontenidos:

- `.deb` para Debian/Ubuntu/MX Linux
- `AppImage` para Linux
- `.exe` instalador para Windows
- `.pkg` instalador para macOS

La base de esos paquetes está en:

- `scripts/package-cli/prepare-bundle.mjs`
- `scripts/package-cli/build-deb.sh`
- `scripts/package-cli/build-appimage.sh`
- `scripts/package-cli/build-windows-installer.ps1`
- `scripts/package-cli/build-macos-pkg.sh`
- `.github/workflows/build-native-packages.yml`

La idea es siempre la misma:

- construir la CLI
- empaquetarla con un runtime de Node incluido
- descargar Chrome for Testing dentro de `runtime/puppeteer`
- instalar un comando final llamado `execonvert`

## Estadísticas de visitas

La app puede integrarse con un contador propio en IONOS:

- resumen mínimo en el pie
- carga asíncrona para no bloquear la UI
- panel privado por aplicación
- series temporales y referrers

Backend base de esta app:

- `analytics/execonvert/track.php`
- `analytics/execonvert/admin-stats.php`
- `analytics/execonvert/lib.php`
- `analytics/execonvert/config.sample.php`

## Arquitectura

- `src/converter.ts`: parser del `.elpx`, selección de páginas, normalización HTML y exportación a `.docx` y `.pdf`.
  La ruta PDF principal en Node/CLI usa HTML imprimible + MathJax SVG + Puppeteer; `pdfmake` queda como fallback del navegador web.
- `src/legacy-elp.ts`: conversión de `.elp` legacy a `.elpx` mediante bundles de eXeLearning.
- `src/docx-import.ts`: importación de `.docx` a `.elpx`.
- `src/markdown-import.ts` y `src/elpx-markdown.ts`: conversiones entre `.md` y `.elpx`.
- `src/main.ts`: interfaz web estática.

La siguiente iteración razonable es sustituir el parser simplificado por una integración más directa con la lógica de exportación de eXeLearning.
