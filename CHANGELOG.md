# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

Categorías usadas: **Añadido**, **Cambiado**, **Corregido**, **Eliminado**.

## [Unreleased]

## [0.5.4] - 2026-09-05

### Corregido
- Una opción mal escrita con un solo guion (por ejemplo `-o salida.elpx`) se
  tomaba como si fuera un archivo de entrada y se descartaba sin decir nada,
  mientras la conversión escribía en su destino por defecto. Si allí ya había un
  archivo con ese nombre, se sobrescribía sin aviso. Ahora se rechaza como
  opción desconocida. Para elegir la salida siguen estando
  `execonvert <entrada> <salida>` y `--out-dir`.
- Los archivos de entrada que se descartan por no admitir la conversión pedida
  se anuncian por la salida de errores en lugar de desaparecer en silencio.

## [0.5.3] - 2026-09-05

### Corregido
- Los `.elpx` generados desde `.docx` y `.md` se escribían sin comprimir, de
  modo que ocupaban unas cuatro veces más de lo debido: un proyecto que
  eXeLearning guarda en 2,4 MB salía de 10,3 MB. El empaquetado usa ahora el
  mismo nivel de compresión habitual del formato, sin coste apreciable de
  tiempo. Los archivos anteriores siguen abriéndose con normalidad.

## [0.5.2] - 2026-09-05

### Corregido
- Las fórmulas de los `.docx` se perdían al convertir desde la línea de órdenes:
  el documento se recorría buscando los nodos `m:oMath` por espacio de nombres,
  algo que el navegador resuelve pero linkedom —el DOM que usa la CLI— no, de
  modo que no encontraba ninguna y las fórmulas desaparecían sin aviso. Ahora la
  búsqueda funciona en ambos entornos y el fragmento OMML se reinterpreta con
  `@xmldom/xmldom` antes de convertirlo, que es lo que el conversor entiende.
  La versión web no estaba afectada. Se añade una prueba de regresión
  (`npm run test:docx`) que comprueba que una fórmula llega a `content.xml`
  convertida en LaTeX.

## [0.5.1] - 2026-09-05

### Cambiado
- La conversión de fórmulas OMML de `.docx` ya no depende del paquete
  `omml2mathml`, abandonado desde 2017. Se incorpora una copia en
  `src/vendor/omml2mathml/` (Apache-2.0) cuya única modificación funcional es
  crear el documento de salida con `@xmldom/xmldom` en lugar de `get-dom`.
  Con ello desaparecen del árbol `jsdom@9`, `request`, `har-validator`, `abab`,
  `uuid@3`, `content-type-parser` y `whatwg-encoding`: instalar el paquete pasa
  de mostrar siete avisos de dependencias obsoletas a uno solo, y las alertas de
  seguridad en dependencias de producción bajan de 15 a 7, sin ninguna crítica.
  La conversión se ha comprobado contra los 178 casos de prueba del proyecto
  original.

## [0.5.0] - 2026-09-05

### Añadido
- Comprobación diaria de actualizaciones de eXeConvert en la CLI interactiva,
  desactivable mediante `--no-update-check` o `EXECONVERT_NO_UPDATE_CHECK=1`.
  No interfiere con tuberías, CI, JSON ni conversiones sin conexión.
- `execonvert update --check` y `execonvert update`: consulta de versiones,
  actualización mediante npm o descarga verificada de instaladores nativos.
- Identificación del canal de instalación y de la arquitectura en los paquetes
  nativos, con nombres explícitos de arquitectura para macOS y Windows.
- Comprobación semanal de nuevas versiones de eXeLearning en GitHub Actions:
  prueba las conversiones y genera un parche para revisión, sin publicarlo.
- Pruebas del actualizador y de las conversiones de CLI y navegador con un
  proyecto sintético que incluye páginas, imagen, fórmulas y traducciones.

### Cambiado
- Runtime embebido de eXeLearning actualizado de **v4.0.1** a **v4.0.3**,
  incluidos los importadores, exportadores, temas, iDevices y traducciones
  compartidos por la web y la CLI.

## [0.4.2] - 2026-06-25

### Corregido
- `CLI_VERSION` ya no está hardcodeado: el script de build lo inyecta desde
  `package.json` al compilar, por lo que versión del binario y versión del
  paquete npm siempre coinciden sin intervención manual.

## [0.4.1] - 2026-06-25

### Corregido
- La versión reportada por `execonvert --version` mostraba `0.3.1` en lugar de `0.4.0`
  porque `CLI_VERSION` estaba hardcodeado en el fuente y no se actualizó en el bump anterior.

## [0.4.0] - 2026-06-25

### Añadido
- Script `scripts/sync-exe-bundles.sh` y comando `npm run sync:exe` para
  actualizar el runtime embebido de eXeLearning (`app/public/exelearning/`)
  desde la última release estable, registrando versión, tag y commit en
  `app/public/exelearning/runtime-source.json`. Una sola fuente cubre web y
  escritorio, porque el build de la CLI copia `app/public/` tal cual.
- Este `CHANGELOG.md`, incluido también en el paquete npm distribuible.
- Soporte de traducciones (i18n) en la conversión legacy `.elp → .elpx`: el
  fetcher implementa `fetchI18nFile` y `fetchI18nTranslations` (que el exporter
  4.0.1 exige) y el sync trae los archivos i18n de eXeLearning (plantilla + 11
  idiomas). Las etiquetas de navegación y el `common_i18n.js` del proyecto salen
  en el idioma del contenido.

### Cambiado
- Runtime embebido de eXeLearning actualizado a **v4.0.1**. El paquete de temas
  pasa de incluir solo `base` a incluir los 6 oficiales (`base`, `flux`, `neo`,
  `nova`, `universal`, `zen`), lo que habilita la conversión de proyectos con
  cualquiera de esos temas.

### Corregido
- La conversión `.elp → .elpx` dejaba de funcionar con el runtime 4.0.1
  (`this.fetcher.fetchI18nTranslations is not a function`); ahora el fetcher
  implementa los métodos i18n requeridos.

## [0.3.1] - 2026-05-12

### Corregido
- La CLI expande patrones glob internamente para compatibilidad con Windows.

### Cambiado
- Documentación de la página CLI: explicación de los formatos soportados.

## [0.3.0] - 2026-05-12

### Añadido
- Conversión por lotes en la CLI con `--to` y `--out-dir`.

## [0.2.2] - 2026-04-02

### Añadido
- Analítica de visitas dedicada para la CLI.

## [0.2.1] - 2026-04-02

### Cambiado
- Ajustes en la cabecera y los enlaces de la página de la CLI.

## [0.2.0] - 2026-04-02

### Añadido
- Línea de comandos (`execonvert`) para automatizar conversiones, con paquetes
  nativos (`.deb`, AppImage, `.exe`, `.pkg`) generados por GitHub Actions.

## [0.1.0] - 2026-04-01

### Añadido
- Primera versión estable. Conversor estático en navegador y CLI entre `.elp`,
  `.elpx`, `.docx`, `.md` y `.pdf`, usando los bundles de importación y
  exportación de eXeLearning. Exportación PDF con MathJax en SVG.
- Contador de visitas propio para la versión web.

---

Las versiones beta previas (`v0.1.0-beta.*`) y el detalle fino de cada cambio
están en el historial de git. Las entradas anteriores a *Unreleased* se
reconstruyeron a partir de los tags y mensajes de commit existentes.
