# 0004. Menú, contenido y título en sitios que no los marcan

- **Estado:** aceptada; completa el punto 2 de la [0003](0003-importar-un-sitio-entero.md)
- **Fecha:** 2026-10-29

## Contexto

La 0003 tomaba el menú del primer `<nav>` y todo el `<body>` como contenido.
Probado con un Google Sites real («La vegetació del Turó de la Peira», 27
páginas) y con la web de MkDocs descargada con `wget`, salieron estos fallos:

- Google Sites pone el nombre del sitio en una cabecera con el menú y el título
  de cada página en un `<h1>`: cada página salía dos veces.
- MkDocs no usa `<nav>`: su menú es una lista normal. Las páginas salían sin
  orden ni nombres cortos, cada una con su `<h1>` como subpágina, y el índice
  lateral de cada página se colaba con cientos de enlaces a sus propias
  secciones. Los títulos llevaban el icono de enlace permanente.

## Decisión

1. **El menú**: el primer `<nav>` (o `role="navigation"`) con enlaces a páginas
   del sitio y, si no hay ninguno, la primera lista de nivel superior cuyos
   enlaces llevan en su mayoría a páginas del sitio. No se importa como
   contenido en las páginas donde enlaza lo mismo que en la principal: así no
   se borra una lista de enlaces que sea parte del texto.
2. **La cabecera que contiene el menú** es el rótulo del sitio y no se importa.
3. **El contenido marcado** con `<main>` o `role="main"` es el único que se
   importa si tiene algo más que títulos (párrafos, listas, tablas,
   imágenes…). Google Sites marca así solo el título de la página.
4. **El `<h1>` con que empieza una página es su título** y no se importa como
   contenido ni como subpágina. El nombre de la página es el del menú; si no
   lo da el menú, ese `<h1>`; si no hay, su `<title>`.
5. **Un enlace a una parte de la misma página** se quita como cualquier enlace
   que no lleva a ninguna parte: la importación no conserva los `id`.
6. **El enlace permanente de los títulos** (¶, #, un icono), un enlace a una
   sección sin letras ni números dentro de un título, se quita.

## Alternativas descartadas

- **Reconocer cada generador** (Google Sites, MkDocs, Jekyll…) por sus clases.
  Son internas, cambian y no cubren a los demás.
- **El contenido marcado si tiene al menos la mitad del texto.** Falla en las
  páginas cortas, donde el menú y el índice lateral pesan más que el texto.
- **Agrupar las páginas bajo los rótulos del menú que no son página**, como el
  «User Guide» de MkDocs. Habría que inventar páginas vacías; sus páginas
  quedan en el nivel del rótulo.

## Consecuencias

- El Google Sites real entra con sus 27 páginas, cada una una vez y con
  «Crèdits» dentro de «Pàgina principal». MkDocs entra con 19 páginas con los
  nombres del menú y 542 enlaces entre ellas, ninguno roto, y eXeLearning 4.0.6
  lo exporta como sitio web.
- Los casos están en `tests/html.test.mjs` con sitios inventados que copian lo
  que hacen Google Sites y MkDocs.
- Un sitio cuyo menú no sea una lista ni esté en `<nav>` entra igual, en el
  orden de los enlaces y sin jerarquía.
