# 0006. eXeConvert no recoge estadísticas de uso

- **Estado:** aceptada
- **Fecha:** 2026-10-30

## Contexto

Desde marzo de 2026 la web enviaba cada visita a un contador propio en
bilateria.org (`track.php`, con el identificador `execonvert`), y desde abril
de 2026 la página de la versión de terminal (`info/cli.html`) hacía lo mismo
con un contador aparte (`execonvert-cli`). Con la visita iban la dirección de
la página, la página de procedencia y los parámetros UTM. No usaba cookies ni
guardaba la IP, y un aviso «Privacidad» del pie lo explicaba. El código del
contador estaba en `analytics/execonvert/` y la configuración, en etiquetas
`meta` de `app/index.html` y de `info/cli.html`.

La versión de terminal (npm y paquetes nativos) nunca ha llamado al contador:
solo consulta GitHub para buscar versiones nuevas. El `cli.html` que viaja
dentro del paquete, porque `build-cli.mjs` copia entera `app/public/`, el
programa no lo abre.

La evaluación con la rúbrica VCER de la guía «Vibe coding responsable» puntúa
con 0 el punto de datos personales si el recurso lleva analítica, sea propia o
ajena. Además, la página de procedencia puede delatar el aula virtual desde la
que se abre la web.

## Decisión

En la versión 0.7.6 se retira toda la analítica: el código de `src/main.ts` y
de `info/cli.html`, las etiquetas `meta`, los textos del contador en
`src/i18n.ts`, el apartado del README y la carpeta `analytics/`. El enlace
«Privacidad» del pie se mantiene y describe ahora las comunicaciones reales,
en los tres idiomas: la web convierte los archivos en el navegador, no los
envía a ningún servidor, no recoge estadísticas ni usa cookies, recuerda en el
navegador el idioma y el tema, y descarga de Google Fonts la fuente de los
iconos y, si el documento tiene fórmulas, MathJax de jsDelivr. La página de la
versión de terminal dice lo mismo de sí misma y que consulta la API de GitHub
para mostrar la última versión.

## Alternativas descartadas

- **Mantener el contador propio con el aviso de privacidad.** Aunque no usaba
  cookies ni guardaba la IP, seguía enviando la dirección de la página y la de
  procedencia, y la rúbrica VCER puntúa con 0 cualquier analítica.

## Consecuencias

- Ya no hay cifras de uso de la web ni de la página de la versión de terminal.
- Los datos y los archivos de los dos contadores en el alojamiento de IONOS
  (`/app/estadistica/execonvert/` y `/app/estadistica/execonvert-cli/`) y su
  entrada en el panel central se archivan y se borran aparte.
- Las versiones de terminal ya instaladas no se ven afectadas cuando el
  contador desaparezca, porque ninguna lo ha llamado nunca. Si el navegador
  sirviera de su caché una versión antigua de la web, pediría `track.php` y,
  al no encontrarlo, seguiría funcionando sin avisar: la petición se hacía al
  terminar de cargar la página, con un `<script>` cuyo error solo lo
  retiraba.
- Volver a añadir analítica, propia o ajena, exige revisar esta decisión.
