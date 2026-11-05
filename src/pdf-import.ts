/*
  Importación de PDF en la web (ADR 0007).

  La conversión de PDF a Markdown es la de EdiMarkdown, copiada tal cual en
  `app/public/pdf/` por `scripts/sync-pdf-import.mjs`: su diálogo (páginas,
  encabezados y pies repetidos, imágenes, OCR y vista previa), su worker y su
  motor (Pyodide con PyMuPDF, unos 34 MB que solo se descargan al abrir un PDF).
  Aquí se le da lo que el diálogo espera encontrar en la página y se convierte
  su resultado en un proyecto con el mismo camino que un `.md`.
*/
import type { Locale } from './i18n.js';
import pdfData from './pdf-import-data.json';
import { placeFootnotes, renderPdfPreviewMarkdown, type PdfImportResult } from './pdf-markdown.js';

export { convertPdfResultToElpx, type PdfImportResult } from './pdf-markdown.js';

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

/*
  El diálogo da por hechas tres cosas de EdiMarkdown: `marked` para su vista
  previa, las dos funciones que componen las notas en ella y Tesseract.js, que
  allí se carga con la página. Aquí Tesseract solo se descarga si se aplica el
  OCR: el diálogo pide `createWorker` justo entonces.
*/
function installDialogGlobals(): void {
  const scope = window as unknown as Record<string, unknown>;
  if (!scope.marked) {
    scope.marked = { parse: renderPdfPreviewMarkdown };
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
