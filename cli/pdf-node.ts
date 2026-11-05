/*
  Importación de PDF en la versión de terminal (ADR 0008).

  Ejecuta en Node el mismo conversor que la web (ADR 0007): el motor de
  `app/public/pdf/vendor/pdf-runtime/` (Pyodide con PyMuPDF) y el guion
  `pdf-import.py` de EdiMarkdown, copiados tal cual. Lo que en la web hace el
  worker (`pdf-worker.js`) se repite aquí, sin diálogo: las opciones llegan de
  la línea de órdenes. El OCR usa Tesseract.js, como la web, y decide qué texto
  se queda en cada página con `ocrPageMarkdown`, la función de EdiMarkdown.
*/
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { PdfImportResult } from '../src/pdf-markdown.js';
import { updateCacheDir } from './updates.js';

export type PdfCliOptions = {
  /** Páginas del PDF, como en el diálogo: «1-3, 5»; vacío, todas. */
  pages: string;
  removeHeaders: boolean;
  keepImages: boolean;
  ocr: boolean;
  /** Código de Tesseract: spa, cat, eng, glg o eus. */
  ocrLanguage: string;
};

export type PdfCliProgress = (stage: string, done: number, total: number) => void;

export type PdfCliResult = PdfImportResult & {
  pages: number;
  textPages: number;
  ocrPages: number;
};

export const OCR_LANGUAGES = ['spa', 'cat', 'eng', 'glg', 'eus'] as const;

/** Un error que ya trae su clave de mensaje (`pdf_password`, `pdf_pages_invalid`…). */
export class PdfCliError extends Error {
  constructor(readonly key: string) {
    super(key);
  }
}

const PDF_DIR = fileURLToPath(new URL('../app/public/pdf/', import.meta.url));
const RUNTIME_DIR = join(PDF_DIR, 'vendor', 'pdf-runtime') + '/';
// Las mismas piezas, en el mismo orden, que carga pdf-worker.js.
const PACKAGES = ['numpy', 'pillow', 'packaging'];
const WHEELS = [
  'pymupdf-1.28.2-cp313-abi3-pyemscripten_2025_0_wasm32.whl',
  'pymupdf4llm-1.28.2-py3-none-any.whl',
  'tabulate-0.9.0-py3-none-any.whl',
];
/*
  El retoque que hace pdf-worker.js a pymupdf4llm en el sistema de archivos
  efímero de Pyodide: quita dos importaciones opcionales que el conversor no
  usa. `tests/pdf-cli.test.mjs` comprueba que estas dos líneas siguen siendo
  las del worker.
*/
export const RUNTIME_PATCH = [
  ['helpers/utils.py', 'from pymupdf4llm.ocr.analyze_page import analyze_page'],
  ['__init__.py', 'from .batch_converter import convert_batch'],
] as const;
// Las imágenes salen como archivos de esta carpeta, igual que en la web.
const IMAGE_FOLDER = 'pdf';
// Los datos de idioma de Tesseract, los mismos que descarga la web.
const OCR_LANG_PATH = (language: string) =>
  `https://cdn.jsdelivr.net/npm/@tesseract.js-data/${language}@1.0.0/4.0.0_best_int`;

type PyProxy = { toJs?: () => unknown; destroy?: () => void };
type Pyodide = {
  loadPackage: (names: string | string[], options?: { messageCallback?: (message: string) => void }) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { set: (name: string, value: unknown) => void; delete: (name: string) => void };
};

let runtimePromise: Promise<Pyodide> | null = null;

async function loadRuntime(): Promise<Pyodide> {
  // CommonJS: ver el package.json que escribe scripts/sync-pdf-import.mjs.
  const require = createRequire(join(RUNTIME_DIR, 'pyodide.js'));
  const { loadPyodide } = require(join(RUNTIME_DIR, 'pyodide.js')) as {
    loadPyodide: (options: Record<string, unknown>) => Promise<Pyodide>;
  };
  const quiet = () => {};
  const py = await loadPyodide({ indexURL: RUNTIME_DIR, stdout: quiet, stderr: quiet });
  for (const name of PACKAGES) await py.loadPackage(name, { messageCallback: quiet });
  for (const wheel of WHEELS) await py.loadPackage(join(RUNTIME_DIR, wheel), { messageCallback: quiet });
  py.runPython(`
from pathlib import Path
import sysconfig
root = Path(sysconfig.get_paths()['purelib']) / 'pymupdf4llm'
for relative, line in ${JSON.stringify(RUNTIME_PATCH)}:
    path = root / relative
    text = path.read_text()
    if text.count(line) != 1:
        raise RuntimeError('Unexpected PDF converter version')
    path.write_text(text.replace(line, ''))
`);
  py.runPython(await readFile(join(PDF_DIR, 'pdf-import.py'), 'utf8'));
  return py;
}

function runtime(): Promise<Pyodide> {
  runtimePromise ||= loadRuntime().catch(error => {
    runtimePromise = null;
    throw error;
  });
  return runtimePromise;
}

function asBytes(value: unknown): Uint8Array {
  const proxy = value as PyProxy;
  const plain = typeof proxy?.toJs === 'function' ? proxy.toJs() : value;
  try {
    return new Uint8Array(plain as ArrayLike<number>);
  } finally {
    proxy?.destroy?.();
  }
}

type EdiMarkdownPdf = {
  ocrPageMarkdown: (text: string, page: { index: number; page: number; fallback: string; letters: number }) => string;
};
type MarkupSafety = { stripUnsafeMarkup: (markdown: string) => string };

/*
  Tesseract.js decide al cargarse si está en un navegador mirando si existe
  `document`, y la CLI pone uno (linkedom, en runtime.ts) para otras
  conversiones: creía estar en un navegador y fallaba al buscar la dirección
  de su script. Mientras se carga, `document` no está.
*/
async function importTesseract(): Promise<typeof import('tesseract.js')> {
  const scope = globalThis as Record<string, unknown>;
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'document');
  if (saved) delete scope.document;
  try {
    const module = await import('tesseract.js');
    return ((module as { default?: typeof import('tesseract.js') }).default ?? module) as typeof import('tesseract.js');
  } finally {
    if (saved) Object.defineProperty(globalThis, 'document', saved);
  }
}

async function applyOcr(
  py: Pyodide,
  markdown: string,
  pages: { index: number; page: number; fallback: string; letters: number }[],
  language: string,
  onProgress?: PdfCliProgress,
): Promise<string> {
  const { ocrPageMarkdown } = (await import(pathToFileURL(join(PDF_DIR, 'pdf-import.js')).href)) as EdiMarkdownPdf;
  const { createWorker, OEM } = await importTesseract();
  const cachePath = join(updateCacheDir(), 'tesseract');
  await mkdir(cachePath, { recursive: true });
  const worker = await createWorker(language, OEM.LSTM_ONLY, { langPath: OCR_LANG_PATH(language), cachePath });
  try {
    let result = markdown;
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      onProgress?.('ocr', index + 1, pages.length);
      py.globals.set('ocr_page_index', page.index);
      let image: Uint8Array;
      try {
        image = asBytes(py.runPython('render_ocr_page(pdf_bytes, ocr_page_index)'));
      } finally {
        py.globals.delete('ocr_page_index');
      }
      const recognition = await worker.recognize(Buffer.from(image));
      result = result.replace(`<!-- edimark-ocr-page:${page.page} -->`, () => ocrPageMarkdown(recognition.data?.text ?? '', page));
    }
    return result;
  } finally {
    await worker.terminate();
  }
}

/** Convierte un PDF a Markdown con el conversor de EdiMarkdown, como la web. */
export async function convertPdfToMarkdown(
  data: Uint8Array,
  options: PdfCliOptions,
  onProgress?: PdfCliProgress,
): Promise<PdfCliResult> {
  onProgress?.('loading', 0, 0);
  const py = await runtime();
  const images = new Map<string, Uint8Array>();
  py.globals.set('pdf_bytes', data);
  try {
    py.globals.set('pdf_options', JSON.stringify({
      assetFolder: IMAGE_FOLDER,
      pages: options.pages,
      removeHeaders: options.removeHeaders,
      keepImages: options.keepImages,
      ocr: options.ocr,
      ocrLanguage: options.ocrLanguage,
    }));
    py.globals.set('report_progress', (stage: string, done: number, total: number) => onProgress?.(stage, done, total));
    py.globals.set('emit_image', (path: string, bytes: unknown) => images.set(path, asBytes(bytes)));
    let result: {
      markdown: string;
      pages: number;
      textPages: number;
      ocrPages?: { index: number; page: number; fallback: string; letters: number }[];
    };
    try {
      result = JSON.parse(String(py.runPython('convert_json(pdf_bytes, pdf_options, report_progress, emit_image)')));
    } catch (error) {
      const message = String(error);
      const key = ['pdf_pages_invalid', 'pdf_password'].find(candidate => message.includes(candidate));
      throw key ? new PdfCliError(key) : error;
    } finally {
      py.globals.delete('pdf_options');
      py.globals.delete('report_progress');
      py.globals.delete('emit_image');
    }
    const ocrPages = options.ocr ? result.ocrPages ?? [] : [];
    let markdown = result.markdown;
    if (ocrPages.length > 0) {
      markdown = await applyOcr(py, markdown, ocrPages, options.ocrLanguage, onProgress);
    }
    const { stripUnsafeMarkup } = (await import(pathToFileURL(join(PDF_DIR, 'markup-safety.js')).href)) as MarkupSafety;
    markdown = stripUnsafeMarkup(markdown);
    if (!markdown.trim()) throw new PdfCliError('pdf_empty');
    // Como al aceptar el diálogo: solo las imágenes que el texto usa.
    const used = new Set(Array.from(markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g), match => match[1]));
    return {
      markdown,
      images: Array.from(images)
        .filter(([path]) => used.has(path))
        .map(([relativePath, bytes]) => ({ relativePath, bytes })),
      pages: result.pages,
      textPages: result.textPages,
      ocrPages: ocrPages.length,
    };
  } finally {
    py.globals.delete('pdf_bytes');
  }
}
