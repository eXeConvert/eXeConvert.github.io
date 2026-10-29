# 0003. Importar un sitio web entero desde un .zip

- **Estado:** aceptada
- **Fecha:** 2026-10-29

## Contexto

Google Sites no tiene un botón de descarga. Google Takeout lo exporta dentro de
los datos de Drive como un `.zip` con un `.html` por página y las imágenes de
cada una en una carpeta de su mismo nombre. Hasta ahora eXeConvert convertía
una sola página por `.zip`, la de `index.html` o la primera que encontraba, y
había que hacer un `.zip` por página y juntar los proyectos en eXeLearning.

En el `.html` de cada página va el menú del sitio completo, como listas
anidadas (`<ul>` dentro de `<li>`) dentro de `<nav>`. Google Sites repite las
entradas en un submenú «More» y no exporta `index.html`.

## Decisión

1. **Qué páginas forman el sitio.** La principal (`index.html` o, si no hay, la
   primera) y todas las que se alcanzan desde ella siguiendo enlaces, también
   los del menú. Un `.html` al que no lleva ningún enlace, como los marcos que
   guarda un navegador junto a una página, no entra. Si solo se alcanza una
   página, la importación es la de siempre.
2. **Orden, jerarquía y títulos, los del menú**: el primer `<nav>` de la
   página principal que tenga una lista con enlaces a páginas del sitio. Cada
   página se llama como su entrada; las entradas repetidas cuentan una vez. Las
   páginas que el menú no recoge van detrás, en el orden en que se enlazan, con
   su `<title>`. Sin menú, la principal va primero.
3. **Cada archivo es una página**, y sus encabezados se convierten en iDevices
   o subpáginas suyas con las mismas opciones que una página suelta.
4. **Los enlaces entre páginas, de eXeLearning**: `exe-node:<id de la
   página>`, que eXeLearning convierte en la dirección de cada página al
   exportar. Las páginas del paquete y la vista previa los reciben ya
   resueltos. Un enlace a una parte de otra página lleva a la página, porque
   la importación no conserva los `id` de los elementos.
5. **Cuatro niveles como máximo**, los que admite la importación. Una página
   más honda pasa a ser hermana de su página madre.

## Alternativas descartadas

- **Un `.zip` por página y juntarlas en eXeLearning.** Es lo que había: muchos
  pasos y los enlaces entre páginas se perdían.
- **Todos los `.html` del `.zip` como páginas.** Entraría cualquier archivo
  suelto, como los marcos guardados con una página.
- **El orden por nombre o por carpetas.** Takeout no dice el orden y el nombre
  de los archivos pierde las tildes; el menú es lo único que lo refleja.
- **Recortar el nombre del sitio en los títulos («Sitio - Página»).** Cada web
  lo escribe de una forma; con el menú no hace falta, porque da el nombre corto.

## Consecuencias

- El `.zip` de Takeout se sube tal cual, sin prepararlo. El sitio de prueba,
  de dos páginas, entra con su menú («Inicio», «Documentación»), con el enlace
  entre ellas y con las imágenes. eXeLearning 4.0.5 y 4.0.6 lo exportan como
  sitio web con los enlaces resueltos.
- La jerarquía de páginas anidadas, el submenú repetido, una página que solo
  se enlaza desde el texto y un marco sin enlaces se han comprobado con un
  sitio inventado (`tests/html.test.mjs`), no con un Google Sites real con
  subpáginas.
- Si Google cambia el marcado del menú, el orden pasaría a ser el de los
  enlaces; las páginas seguirían entrando todas.
