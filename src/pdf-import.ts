/*
  Importación de PDF en la web (ADR 0007).

  La conversión de PDF a Markdown es la de EdiMarkdown, copiada tal cual en
  `app/public/pdf/` por `scripts/sync-pdf-import.mjs`: su diálogo (páginas,
  encabezados y pies repetidos, imágenes, OCR y vista previa), su worker y su
  motor (Pyodide con PyMuPDF, unos 34 MB que solo se descargan al abrir un PDF).
  Aquí se le da lo que el diálogo espera encontrar en la página y se convierte
  su resultado en un proyecto con el mismo camino que un `.md`.
*/
import { convertHtmlToElpx, type DocxImportOptions, type DocxImportProgress, type ImportToElpxResult } from './docx-import.js';
import type { Locale } from './i18n.js';
import { createMarkdownRenderer } from './markdown-import.js';
import pdfData from './pdf-import-data.json';

export type PdfImportResult = {
  markdown: string;
  images: { relativePath: string; bytes: Uint8Array }[];
};

type PdfImporterModule = {
  importPdf: (
    file: File,
    translate: (key: string, fallback: string) => string,
    assetFolder?: string,
  ) => Promise<PdfImportResult | null>;
};

// Las imágenes salen del worker como archivos de esta carpeta, en vez de
// viajar en base64 dentro del Markdown.
const IMAGE_FOLDER = 'pdf';

// La misma versión y la misma huella que carga EdiMarkdown.
const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js';
const TESSERACT_INTEGRITY = 'sha384-2BQ3U3OdKOb0Uczxqr41I9UvZkzr4V9Hv8uSzMMZAlmhsFClvdZX5wi5fDCzG+tM';

// Los rótulos que en EdiMarkdown hablan de abrir una pestaña nueva.
const DIALOG_OVERRIDES: Record<string, string> = {
  pdf_preview: 'pdf.dialog.convert',
  pdf_accept: 'pdf.dialog.accept',
  pdf_importing: 'pdf.dialog.importing',
};

const markdownRenderer = createMarkdownRenderer({ html: true });

let importerPromise: Promise<PdfImporterModule> | null = null;

export function pdfImporterVersion(): string {
  return pdfData.source.version;
}

function dialogTranslator(locale: Locale, t: (key: string) => string) {
  const locales = pdfData.locales as Record<string, Record<string, string>>;
  return (key: string, fallback: string): string => {
    const override = DIALOG_OVERRIDES[key];
    if (override) return t(override);
    return locales[locale]?.[key] ?? locales.es?.[key] ?? fallback;
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type Footnote = { number: number; content: string };

/*
  Las notas al pie que el conversor escribe como `[^n]` y `[^n]: …`. Se
  numeran por orden de aparición y cada una se pone, como hace la importación
  de LaTeX, al final de la sección donde se cita: justo antes del encabezado
  siguiente, que puede abrir otra página del proyecto. Una definición que
  nada cita no se escribe, igual que en la vista previa de EdiMarkdown. En un
  encabezado la llamada se quita, porque pasaría al título de la página.
*/
export function placeFootnotes(markdown: string): string {
  const lines = markdown.split('\n');
  const definitions = new Map<string, string>();
  let fence: string | null = null;
  for (let index = 0; index < lines.length; index += 1) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(lines[index]);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence) continue;
    const definition = /^ {0,3}\[\^([^\]\s]+)\]:[ \t]*(.*)$/.exec(lines[index]);
    if (!definition) continue;
    const content = [definition[2]];
    lines[index] = '';
    let cursor = index + 1;
    while (cursor < lines.length && /^(?: {4}|\t)/.test(lines[cursor])) {
      content.push(lines[cursor].replace(/^(?: {4}|\t)/, ''));
      lines[cursor] = '';
      cursor += 1;
    }
    definitions.set(definition[1], content.join(' ').trim());
    index = cursor - 1;
  }
  if (definitions.size === 0) return markdown;

  const numbers = new Map<string, number>();
  let pending: Footnote[] = [];
  const output: string[] = [];
  const flush = () => {
    if (pending.length === 0) return;
    output.push('', ...pending.map(note => `<sup>${note.number}</sup> ${note.content}\n`), '');
    pending = [];
  };
  fence = null;
  for (const line of lines) {
    const fenceMatch = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!fence) fence = marker;
      else if (fence === marker) fence = null;
      output.push(line);
      continue;
    }
    if (fence) {
      output.push(line);
      continue;
    }
    const heading = /^ {0,3}#{1,6}(?:\s|$)/.test(line);
    if (heading) flush();
    output.push(line.replace(/(`+[^`]*`+)|(?<!\\)\[\^([^\]\s]+)\]/g, (match, code, label) => {
      if (code || !definitions.has(label)) return match;
      let number = numbers.get(label);
      if (!number) {
        number = numbers.size + 1;
        numbers.set(label, number);
        pending.push({ number, content: definitions.get(label) || '' });
      }
      // A heading becomes the page or block title, where a raised number
      // would read as part of the name ("Notes1"): the note stays, the mark goes.
      return heading ? '' : `<sup>${number}</sup>`;
    }));
  }
  flush();
  return output.join('\n');
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
};

/*
  Del Markdown del PDF al HTML que montan los demás importadores. Las
  imágenes, que llegan como archivos aparte, pasan a `data:` para que el paso
  común (ADR 0002) las lleve a `content/resources` y reduzca las grandes.
*/
export function renderPdfMarkdown(result: PdfImportResult): string {
  let html = markdownRenderer.render(placeFootnotes(result.markdown));
  for (const image of result.images) {
    const extension = image.relativePath.split('.').pop()?.toLowerCase() || '';
    const mime = IMAGE_TYPES[extension];
    if (!mime) continue;
    const src = escapeHtml(markdownRenderer.normalizeLink(image.relativePath));
    html = html.split(`src="${src}"`).join(`src="data:${mime};base64,${bytesToBase64(image.bytes)}"`);
  }
  return html;
}

export async function convertPdfResultToElpx(
  result: PdfImportResult,
  filename: string,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'parse', message: 'Convirtiendo Markdown a HTML...', messageKey: 'progress.markdownToHtml' });
  return convertHtmlToElpx(renderPdfMarkdown(result), filename, options, onProgress, 'progress.parseMarkdownStructure');
}

/*
  El diálogo da por hechas tres cosas de EdiMarkdown: `marked` para su vista
  previa, las dos funciones que componen las notas en ella y Tesseract.js, que
  allí se carga con la página. Aquí Tesseract solo se descarga si se aplica el
  OCR: el diálogo pide `createWorker` justo entonces.
*/
function installDialogGlobals(): void {
  const scope = window as unknown as Record<string, unknown>;
  if (!scope.marked) {
    scope.marked = { parse: (source: string) => markdownRenderer.render(source) };
  }
  if (!scope.preparePreviewFootnotes) {
    scope.preparePreviewFootnotes = (source: string) => ({ markdown: placeFootnotes(source), notes: [] });
    scope.renderPreviewFootnotes = () => '';
  }
  if (!scope.Tesseract) {
    let loading: Promise<void> | null = null;
    const lazy = {
      OEM: { LSTM_ONLY: 1 },
      async createWorker(...args: unknown[]) {
        loading ||= new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = TESSERACT_URL;
          script.integrity = TESSERACT_INTEGRITY;
          script.crossOrigin = 'anonymous';
          script.onload = () => resolve();
          script.onerror = () => {
            loading = null;
            script.remove();
            reject(new Error('Tesseract unavailable'));
          };
          document.head.append(script);
        });
        await loading;
        const real = scope.Tesseract as { createWorker?: (...values: unknown[]) => Promise<unknown> } | undefined;
        if (!real?.createWorker || real === lazy) throw new Error('Tesseract unavailable');
        return real.createWorker(...args);
      },
    };
    scope.Tesseract = lazy;
  }
}

function loadImporter(): Promise<PdfImporterModule> {
  if (!importerPromise) {
    installDialogGlobals();
    const url = new URL(`pdf/pdf-import.js?v=${encodeURIComponent(pdfData.source.version)}`, document.baseURI).href;
    importerPromise = (import(/* @vite-ignore */ url) as Promise<PdfImporterModule>).catch(error => {
      importerPromise = null;
      throw error;
    });
  }
  return importerPromise;
}

/** Abre el diálogo de EdiMarkdown. Devuelve null si se cancela. */
export async function openPdfDialog(
  file: File,
  locale: Locale,
  t: (key: string) => string,
): Promise<PdfImportResult | null> {
  const { importPdf } = await loadImporter();
  return importPdf(file, dialogTranslator(locale, t), IMAGE_FOLDER);
}
