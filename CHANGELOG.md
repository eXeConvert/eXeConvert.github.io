# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

Categorías usadas: **Añadido**, **Cambiado**, **Corregido**, **Eliminado**.

## [Unreleased]

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
