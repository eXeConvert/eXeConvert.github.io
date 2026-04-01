import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { DOMParser, parseHTML } from 'linkedom';

let configured = false;
const require = createRequire(import.meta.url);
let cliPdfWindow: (Window & typeof globalThis) | null = null;

class CliXmlSerializer {
  serializeToString(node: unknown): string {
    if (node && typeof node === 'object') {
      const candidate = node as {
        toString?: () => string;
        outerHTML?: string;
        documentElement?: { outerHTML?: string };
      };
      if (typeof candidate.outerHTML === 'string') {
        return candidate.outerHTML;
      }
      if (candidate.documentElement?.outerHTML) {
        return candidate.documentElement.outerHTML;
      }
      if (typeof candidate.toString === 'function') {
        return candidate.toString();
      }
    }
    return String(node ?? '');
  }
}

function installReplaceWithPolyfill(window: Window & typeof globalThis): void {
  const toFragment = (referenceNode: Node, nodes: Array<string | Node>): DocumentFragment => {
    const document = ((referenceNode as Node).ownerDocument || window.document) as Document;
    const fragment = document.createDocumentFragment();
    for (const node of nodes) {
      if (typeof node === 'string') {
        fragment.appendChild(document.createTextNode(node));
        continue;
      }
      fragment.appendChild(node);
    }
    return fragment;
  };

  const installOn = (ctor: unknown): void => {
    if (!ctor || typeof ctor !== 'function') {
      return;
    }

    const prototype = (ctor as { prototype?: Record<string, unknown> }).prototype;
    if (!prototype) {
      return;
    }

    if (typeof prototype.replaceWith !== 'function') {
      Object.defineProperty(prototype, 'replaceWith', {
        configurable: true,
        writable: true,
        value: function replaceWith(...nodes: Array<string | Node>) {
          const parent = (this as Node).parentNode;
          if (!parent) {
            return;
          }

          parent.replaceChild(toFragment(this as Node, nodes), this as Node);
        },
      });
    }

    if (typeof prototype.append !== 'function') {
      Object.defineProperty(prototype, 'append', {
        configurable: true,
        writable: true,
        value: function append(...nodes: Array<string | Node>) {
          (this as Node).appendChild(toFragment(this as Node, nodes));
        },
      });
    }

    if (typeof prototype.prepend !== 'function') {
      Object.defineProperty(prototype, 'prepend', {
        configurable: true,
        writable: true,
        value: function prepend(...nodes: Array<string | Node>) {
          (this as Node).insertBefore(toFragment(this as Node, nodes), (this as Node).firstChild);
        },
      });
    }

    if (typeof prototype.before !== 'function') {
      Object.defineProperty(prototype, 'before', {
        configurable: true,
        writable: true,
        value: function before(...nodes: Array<string | Node>) {
          const parent = (this as Node).parentNode;
          if (!parent) {
            return;
          }

          parent.insertBefore(toFragment(this as Node, nodes), this as Node);
        },
      });
    }

    if (typeof prototype.after !== 'function') {
      Object.defineProperty(prototype, 'after', {
        configurable: true,
        writable: true,
        value: function after(...nodes: Array<string | Node>) {
          const parent = (this as Node).parentNode;
          if (!parent) {
            return;
          }

          parent.insertBefore(toFragment(this as Node, nodes), (this as Node).nextSibling);
        },
      });
    }
  };

  installOn(window.Element);
  installOn(window.Text);
  installOn((window as unknown as { CharacterData?: unknown }).CharacterData);
  installOn((window as unknown as { DocumentType?: unknown }).DocumentType);
}

function setupCliDom(): void {
  if (configured) {
    return;
  }

  const { window } = parseHTML('<!doctype html><html><head></head><body></body></html>');
  const globals: Record<string, unknown> = {
    window,
    document: window.document,
    DOMParser: typeof window.DOMParser === 'function' ? window.DOMParser : DOMParser,
    XMLSerializer: typeof window.XMLSerializer === 'function' ? window.XMLSerializer : CliXmlSerializer,
    Image: (window as unknown as { Image?: unknown }).Image,
    Node: window.Node,
    Text: window.Text,
    Element: window.Element,
    HTMLElement: window.HTMLElement,
    HTMLImageElement: window.HTMLImageElement,
    HTMLTableElement: window.HTMLTableElement,
    HTMLTableCellElement: window.HTMLTableCellElement,
    HTMLLinkElement: window.HTMLLinkElement,
    HTMLScriptElement: window.HTMLScriptElement,
    Document: window.Document,
    DocumentFragment: window.DocumentFragment,
    NodeFilter: window.NodeFilter ?? {
      SHOW_ALL: -1,
      SHOW_ELEMENT: 1,
      SHOW_TEXT: 4,
    },
  };

  for (const [key, value] of Object.entries(globals)) {
    if (!(key in globalThis) || globalThis[key as keyof typeof globalThis] == null) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      });
    }
  }

  for (const key of Object.getOwnPropertyNames(window)) {
    if (!/^(HTML.*Element|SVG.*Element|Document|DocumentFragment|Node|Text|Element|XML.*|DOMImplementation)$/.test(key)) {
      continue;
    }
    const value = (window as unknown as Record<string, unknown>)[key];
    if (value == null) {
      continue;
    }
    if (!(key in globalThis) || globalThis[key as keyof typeof globalThis] == null) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value,
      });
    }
  }

  for (const key of ['HTMLOListElement', 'HTMLObjectElement']) {
    if (!(key in globalThis) || globalThis[key as keyof typeof globalThis] == null) {
      Object.defineProperty(globalThis, key, {
        configurable: true,
        writable: true,
        value: window.HTMLElement,
      });
    }
  }

  if (window.document.compatMode !== 'CSS1Compat') {
    Object.defineProperty(window.document, 'compatMode', {
      configurable: true,
      value: 'CSS1Compat',
    });
  }

  installReplaceWithPolyfill(window);

  configured = true;
}

function installCliFetch(): void {
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      const relativePath = input.replace(/^\/+/, '');
      const fileUrl = new URL(`../app/public/${relativePath}`, import.meta.url);
      const data = await readFile(fileUrl);
      return new Response(data, { status: 200 });
    }
    if (input instanceof URL && input.protocol === 'file:') {
      const data = await readFile(input);
      return new Response(data, { status: 200 });
    }
    return nativeFetch(input as RequestInfo | URL, init);
  }) as typeof fetch;
}

function installCliPdfWindowFactory(): void {
  Object.defineProperty(globalThis, '__execonvertRequire', {
    configurable: true,
    writable: true,
    value: require,
  });

  Object.defineProperty(globalThis, '__execonvertCreatePdfWindow', {
    configurable: true,
    writable: true,
    value: () => {
      if (cliPdfWindow) {
        return cliPdfWindow;
      }

      const originalEmitWarning = process.emitWarning.bind(process);
      process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
        const warningCode =
          typeof args[0] === 'string' && /^DEP\d+$/i.test(args[0])
            ? args[0]
            : typeof args[1] === 'string' && /^DEP\d+$/i.test(args[1])
              ? args[1]
              : undefined;
        const warningMessage = typeof warning === 'string' ? warning : warning.message;
        if (warningCode === 'DEP0040' && warningMessage.includes('`punycode` module is deprecated')) {
          return;
        }
        return originalEmitWarning(warning as never, ...(args as []));
      }) as typeof process.emitWarning;

      try {
        const jsdom = require('jsdom') as {
          jsdom: (html: string) => Document & { defaultView: Window & typeof globalThis };
        };
        const documentFromJsdom = jsdom.jsdom('<!doctype html><html><body></body></html>');
        cliPdfWindow = documentFromJsdom.defaultView;
      } finally {
        process.emitWarning = originalEmitWarning;
      }

      return cliPdfWindow;
    },
  });
}

export function installCliRuntime(): void {
  setupCliDom();
  installCliFetch();
  installCliPdfWindowFactory();
}
