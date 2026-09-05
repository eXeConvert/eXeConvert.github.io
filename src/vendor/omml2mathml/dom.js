// omml2mathml solo necesita un documento vacío sobre el que construir el árbol
// MathML de salida. La librería original se lo pedía a get-dom, que arrastra
// jsdom 9 y con él request, har-validator, abab y uuid 3, abandonados desde 2017.
//
// @xmldom/xmldom, que el proyecto ya usa a través de mammoth y mathjax-full,
// crea ese documento sin ninguna de esas dependencias. No se usa el DOM global
// (linkedom en la CLI) porque con él la librería no produce salida: devuelve
// null, tal como hacía la versión original con jsdom en ese mismo entorno.
import { DOMImplementation } from '@xmldom/xmldom';

const implementation = new DOMImplementation();
const createDocument = () => implementation.createDocument(null, null, null);

export default {
  document: createDocument,
  implementation: () => ({ createHTMLDocument: createDocument }),
};
