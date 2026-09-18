# 0001. Reconstruir los bundles de eXeLearning desde el manifest

- **Estado:** aceptada
- **Fecha:** 2026-09-18

## Contexto

eXeConvert lleva incorporado el motor de eXeLearning para convertir proyectos
`.elp` antiguos y para la vista previa web. Hasta la versión 4.0.3, el paquete
estático oficial publicaba los recursos ya empaquetados: `bundles/common.zip`,
`bundles/idevices.zip`, `bundles/libs.zip`, `bundles/content-css.zip` y un
`.zip` por plantilla. `npm run sync:exe` solo tenía que copiarlos, y
`src/legacy-elp.ts` los carga directamente por esas rutas.

Desde la 4.0.5 esos archivos ya no viajan en la release. Solo se publica
`bundles/manifest.json`, que relaciona cada archivo del paquete con la ruta que
le corresponde dentro del sitio exportado, y es la propia aplicación de
eXeLearning la que los comprime cuando hace falta. Al sincronizar sin más, el
script borró los `.zip` antiguos sin poder sustituirlos.

## Decisión

`npm run sync:exe` reconstruye los `.zip` a partir de `bundles/manifest.json`,
con `scripts/build-bundles-from-manifest.mjs`, respetando exactamente la
estructura interna que tenían: un archivo por plantilla, uno de iDevices donde
cada entrada lleva delante el nombre de su iDevice, y los de `libs`, `common` y
`content-css`. Al terminar se comprueba que el número de archivos de cada
bundle coincide con el que declara el manifest.

El script admite los dos formatos y elige según lo que traiga el origen: si
encuentra los `.zip`, los copia como antes; si no, los reconstruye.

## Alternativas descartadas

**Adaptar `src/legacy-elp.ts` para leer archivos sueltos.** Es lo que parece
más simple mirando solo la versión nueva, y por eso conviene dejar escrito por
qué no se hizo. Obligaba a reescribir la conversión de proyectos antiguos, que
es la parte más delicada del programa, sin ninguna mejora para quien lo usa, y
habría impedido volver a sincronizar una versión anterior.

**Congelar los bundles de la 4.0.3.** Habría dejado las conversiones apoyadas
en un motor distinto del que usa la versión que la gente tiene instalada.

## Consecuencias

El código de conversión no cambia. Los `.elp` de la rama 2.x y los `.elpx` de
cualquier 4.0.x se siguen convirtiendo igual, que es la razón de ser del
programa.

La sincronización necesita ahora el comando `zip`, además de `gh`, `unzip` y
`node`. El workflow **Check eXeLearning compatibility** se ejecuta en
`ubuntu-latest`, que ya lo incluye.

Si en el futuro eXeLearning cambia la forma del manifest, el punto que hay que
revisar es `scripts/build-bundles-from-manifest.mjs`. La comprobación del
número de archivos avisa si la correspondencia deja de cuadrar.
