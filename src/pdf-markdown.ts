/*
  Del Markdown que sale del conversor de PDF de EdiMarkdown a un proyecto
  `.elpx` (ADR 0007 y 0008). Lo usan la web, tras el diálogo, y la versión de
  terminal, que ejecuta el mismo conversor en Node: aquí no hay nada del
  navegador.
*/
import { convertHtmlToElpx, type DocxImportOptions, type DocxImportProgress, type ImportToElpxResult } from './docx-import.js';
import { createMarkdownRenderer } from './markdown-import.js';

export type PdfImportResult = {
  markdown: string;
  images: { relativePath: string; bytes: Uint8Array }[];
};

const markdownRenderer = createMarkdownRenderer({ html: true });

export function renderPdfPreviewMarkdown(source: string): string {
  return markdownRenderer.render(source);
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
