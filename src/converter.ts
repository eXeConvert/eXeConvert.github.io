import {
  AlignmentType,
  Document as DocxDocument,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  ImportedXmlComponent,
  Math as DocxMath,
  MathFraction,
  MathRadical,
  MathRun,
  MathSubScript,
  MathSubSuperScript,
  MathSuperScript,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BuilderElement,
  XmlComponent,
  type ISectionOptions,
  type MathComponent,
  type ParagraphChild,
} from 'docx';
import { unzipSync } from 'fflate';
import htmlToPdfmake from 'html-to-pdfmake';
import { mml2omml } from 'mathml2omml';
import temml from 'temml';
import mammoth from 'mammoth';
// @ts-expect-error browser bundle import without stable typings
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-expect-error virtual font bundle import without stable typings
import pdfFonts from 'pdfmake/build/vfs_fonts';

export interface ConvertProgress {
  phase: 'read' | 'parse' | 'filter' | 'render' | 'docx' | 'pdf';
  message: string;
  messageKey?: string;
}

export interface ConvertResult {
  blob: Blob;
  filename: string;
  html: string;
  previewHtml: string;
  pageCount: number;
}

export interface ElpxHtmlResult {
  html: string;
  pageCount: number;
  title: string;
  language: string;
}

export interface PrintableHtmlOptions {
  title?: string;
}

export interface ElpxPageInfo {
  id: string;
  parentId: string | null;
  title: string;
  depth: number;
}

export interface ElpxExportOptions {
  selectedPageIds?: string[];
}

interface ParsedProject {
  title: string;
  subtitle: string;
  language: string;
  pages: ParsedPage[];
}

interface ParsedPage {
  id: string;
  parentId: string | null;
  title: string;
  order: number;
  depth: number;
  contentHtml: string;
}

interface AssetEntry {
  zipPath: string;
  data: Uint8Array;
  mime: string;
}

interface InlineStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: {};
  font?: string;
  color?: string;
}

interface RenderedImageData {
  data: Uint8Array;
  mime: string;
  width: number;
  height: number;
}

interface MathJaxApi {
  tex2svgPromise(expression: string, options?: { display?: boolean }): Promise<HTMLElement>;
  startup?: {
    defaultReady?: () => void;
  };
}

interface MathJaxGlobal {
  tex2svgPromise?: (expression: string, options?: { display?: boolean }) => Promise<HTMLElement>;
  tex?: {
    inlineMath?: string[][];
    displayMath?: string[][];
  };
  svg?: {
    fontCache?: string;
  };
  startup?: {
    ready?: () => void;
    defaultReady?: () => void;
  };
}

const ASSET_DIRECTORIES = ['resources', 'images', 'media', 'files', 'attachments'];
const SYSTEM_FILES = new Set(['content.xml', 'contentv3.xml', 'content.data', 'content.xsd', 'imsmanifest.xml']);
const latexRenderCache = new Map<string, Promise<{ dataUrl: string; width: number; height: number }>>();
let pdfMakeInitialized = false;

export async function convertElpxToDocx(
  file: File,
  options?: ElpxExportOptions,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<ConvertResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .elpx...', messageKey: 'progress.readElpx' });
  const input = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(input);

  onProgress?.({ phase: 'parse', message: 'Analizando content.xml...', messageKey: 'progress.parseContentXml' });
  const project = parseProject(entries);
  const scopedProject = scopeProjectToSelection(project, options?.selectedPageIds);
  const assets = collectAssets(entries);

  onProgress?.({ phase: 'filter', message: 'Aplicando selección de páginas...', messageKey: 'progress.filterPages' });
  onProgress?.({ phase: 'render', message: 'Generando HTML intermedio...', messageKey: 'progress.renderHtml' });
  const html = await buildHtmlDocument(project, scopedProject, assets, entries);

  return convertHtmlToDocxResult(
    html,
    {
      inputName: file.name,
      title: scopedProject.title,
      language: scopedProject.language,
      pageCount: scopedProject.pages.length,
    },
    onProgress,
  );
}

export async function convertElpxToHtml(
  file: File,
  options?: ElpxExportOptions,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<ElpxHtmlResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .elpx...', messageKey: 'progress.readElpx' });
  const input = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(input);

  onProgress?.({ phase: 'parse', message: 'Analizando content.xml...', messageKey: 'progress.parseContentXml' });
  const project = parseProject(entries);
  const scopedProject = scopeProjectToSelection(project, options?.selectedPageIds);
  const assets = collectAssets(entries);

  onProgress?.({ phase: 'filter', message: 'Aplicando selección de páginas...', messageKey: 'progress.filterPages' });
  onProgress?.({ phase: 'render', message: 'Generando HTML intermedio...', messageKey: 'progress.renderHtml' });
  const html = await buildHtmlDocument(project, scopedProject, assets, entries);

  return {
    html,
    pageCount: scopedProject.pages.length,
    title: scopedProject.title,
    language: scopedProject.language,
  };
}

export async function convertHtmlToDocxResult(
  html: string,
  options: {
    inputName: string;
    title: string;
    language: string;
    pageCount: number;
  },
  onProgress?: (progress: ConvertProgress) => void,
): Promise<ConvertResult> {
  onProgress?.({ phase: 'docx', message: 'Generando el documento .docx...', messageKey: 'progress.generateDocx' });
  const blob = await buildCompatibleDocx(html);
  const previewHtml = containsLatex(html)
    ? buildMathEnabledSourcePreviewHtml(html, options.title, options.language)
    : await buildDocxPreviewHtml(blob, options.title, options.language);

  return {
    blob,
    filename: toOutputFilename(options.inputName),
    html,
    previewHtml,
    pageCount: options.pageCount,
  };
}

export function buildPrintableHtmlDocument(htmlDocument: string, options?: PrintableHtmlOptions): string {
  const parsed = new DOMParser().parseFromString(htmlDocument, 'text/html');
  for (const script of Array.from(parsed.querySelectorAll('script'))) {
    script.remove();
  }
  for (const link of Array.from(parsed.querySelectorAll('link[rel="stylesheet"]'))) {
    link.remove();
  }

  const language = parsed.documentElement.lang || 'es';
  const title = options?.title || parsed.title || 'Documento PDF';
  const bodyHtml = parsed.body?.innerHTML || '<p>El proyecto no contiene contenido exportable.</p>';
  const mathJaxLoader = containsLatex(htmlDocument)
    ? `
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
        displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
        processEscapes: true
      },
      svg: { fontCache: 'global' }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>`
    : '';

  return `<!doctype html>
<html lang="${escapeAttribute(language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    html, body { margin: 0; padding: 0; background: #eef1ea; }
    body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
    .pdf-preview {
      box-sizing: border-box;
      width: min(210mm, calc(100% - 32px));
      margin: 24px auto;
      padding: 18mm 16mm;
      background: #fff;
      box-shadow: 0 18px 40px rgba(29, 39, 28, 0.12);
    }
    .pdf-preview * { box-sizing: border-box; max-width: 100%; }
    .pdf-preview table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    .pdf-preview td, .pdf-preview th { border: 0.6px solid #d7ddd2; padding: 6px; vertical-align: top; }
    .pdf-preview img { height: auto; }
    @media print {
      html, body { background: #fff; }
      .pdf-preview {
        width: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      a {
        color: inherit;
        text-decoration: none;
      }
    }
  </style>${mathJaxLoader}
</head>
<body>
  <main class="pdf-preview">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

export async function buildPdfBlobFromPrintableHtml(
  htmlDocument: string,
  options?: PrintableHtmlOptions,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<Blob> {
  onProgress?.({ phase: 'pdf', message: 'Generando el documento .pdf...' });
  ensurePdfMakeFonts();

  const parsed = new DOMParser().parseFromString(htmlDocument, 'text/html');
  const source = parsed.querySelector<HTMLElement>('.pdf-preview') || parsed.body;
  const contentHtml = sanitizeHtmlForPdfMake(source?.innerHTML?.trim() || '<p>El proyecto no contiene contenido exportable.</p>');
  const converted = htmlToPdfmake(contentHtml, {
    window,
    tableAutoSize: true,
    removeExtraBlanks: true,
    defaultStyles: {
      p: { margin: [0, 0, 0, 10] },
      table: { margin: [0, 8, 0, 12] },
      th: { bold: true, fillColor: '#eeeeee' },
      figure: { margin: [0, 8, 0, 12] },
      figcaption: { italics: true, color: '#555555', margin: [0, 4, 0, 8] },
      h1: { fontSize: 22, bold: true, margin: [0, 0, 0, 12] },
      h2: { fontSize: 18, bold: true, margin: [0, 12, 0, 10] },
      h3: { fontSize: 15, bold: true, margin: [0, 10, 0, 8] },
      h4: { fontSize: 13, bold: true, margin: [0, 8, 0, 6] },
      li: { margin: [0, 2, 0, 2] },
      a: { color: '#1f4e79', decoration: 'underline' },
    },
  });

  onProgress?.({ phase: 'pdf', message: 'Componiendo el documento .pdf...' });

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [48, 48, 48, 48] as [number, number, number, number],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 11,
      lineHeight: 1.25,
    },
    content: Array.isArray(converted) ? converted : [converted],
    info: {
      title: options?.title || parsed.title || 'Documento PDF',
    },
  };
  applyPdfMakeTableLayout(docDefinition.content);

  const pdf = pdfMake.createPdf(docDefinition);
  return pdf.getBlob();
}

function applyPdfMakeTableLayout(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      applyPdfMakeTableLayout(item);
    }
    return;
  }

  if (!node || typeof node !== 'object') {
    return;
  }

  const candidate = node as Record<string, unknown>;
  if (candidate.table && typeof candidate.table === 'object') {
    candidate.layout = {
      hLineWidth: () => 0.6,
      vLineWidth: () => 0.6,
      hLineColor: () => '#d7ddd2',
      vLineColor: () => '#d7ddd2',
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    };
  }

  for (const value of Object.values(candidate)) {
    applyPdfMakeTableLayout(value);
  }
}

function sanitizeHtmlForPdfMake(html: string): string {
  const parsed = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
  normalizePdfMakeMarkup(parsed.body);

  for (const element of Array.from(parsed.body.querySelectorAll<HTMLElement>('*'))) {
    element.removeAttribute('height');

    const style = (element.getAttribute('style') || '').trim();
    if (!style) {
      continue;
    }

    const cleanedStyle = style
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .filter(part => {
        const lower = part.toLowerCase();
        if (lower.includes('var(')) {
          return false;
        }
        if (
          lower.startsWith('height:') ||
          lower.startsWith('font-family:') ||
          lower.startsWith('font-size:') ||
          lower.startsWith('font-weight:') ||
          lower.startsWith('text-align:')
        ) {
          return false;
        }
        return true;
      })
      .join('; ');

    if (cleanedStyle) {
      element.setAttribute('style', cleanedStyle);
    } else {
      element.removeAttribute('style');
    }
  }

  return parsed.body.innerHTML;
}

function normalizePdfMakeMarkup(root: HTMLElement): void {
  removeEmptyPdfNodes(root);
  normalizePdfDefinitionLists(root);
  normalizePdfColumnLayouts(root);
  normalizePdfTables(root);
  normalizeLargePdfImages(root);
  normalizeLeadingInlineImages(root);
  normalizeLooseImageCaptions(root);
  normalizePdfCaptions(root);
  normalizeSplitInlineWords(root);
  removeEmptyPdfNodes(root);
}

function removeEmptyPdfNodes(root: HTMLElement): void {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>('p, div, span, dd, dt'))) {
    if (element.querySelector('img, svg, table, ul, ol, li, dl, figure, figcaption, blockquote, pre, iframe, object, embed')) {
      continue;
    }

    const text = normalizeWhitespace(element.textContent || '').replace(/\u00a0/g, ' ').trim();
    if (text) {
      continue;
    }

    const html = (element.innerHTML || '').replace(/<br\s*\/?>/gi, '').trim();
    if (!html) {
      element.remove();
    }
  }
}

function normalizePdfDefinitionLists(root: HTMLElement): void {
  for (const list of Array.from(root.querySelectorAll<HTMLElement>('dl'))) {
    const rows = extractPdfDefinitionRows(list);
    if (rows.length === 0) {
      continue;
    }

    const doc = list.ownerDocument;
    const wrapper = doc.createElement('div');
    wrapper.className = 'pdf-definition-list';

    for (const [term, description] of rows) {
      const paragraph = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = `${normalizeWhitespace(term.textContent || '')}:`;
      paragraph.append(strong);

      const valueText = normalizeWhitespace(description.textContent || '');
      if (valueText) {
        paragraph.append(' ', valueText);
      } else if (description.innerHTML.trim()) {
        const span = doc.createElement('span');
        span.innerHTML = description.innerHTML.trim();
        paragraph.append(' ', span);
      }

      wrapper.append(paragraph);
    }

    list.replaceWith(wrapper);
  }
}

function extractPdfDefinitionRows(list: HTMLElement): Array<[HTMLElement, HTMLElement]> {
  const rows: Array<[HTMLElement, HTMLElement]> = [];
  const wrappers = Array.from(list.children).filter(child => child instanceof HTMLElement);

  if (wrappers.every(wrapper => wrapper.tagName.toLowerCase() === 'div')) {
    for (const wrapper of wrappers) {
      const term = wrapper.querySelector<HTMLElement>('dt');
      const description = wrapper.querySelector<HTMLElement>('dd');
      if (term && description) {
        rows.push([term, description]);
      }
    }
    return rows;
  }

  let currentTerm: HTMLElement | null = null;
  for (const child of Array.from(list.children)) {
    if (!(child instanceof HTMLElement)) {
      continue;
    }
    const tag = child.tagName.toLowerCase();
    if (tag === 'dt') {
      currentTerm = child;
      continue;
    }
    if (tag === 'dd' && currentTerm) {
      rows.push([currentTerm, child]);
      currentTerm = null;
    }
  }

  return rows;
}

function normalizePdfColumnLayouts(root: HTMLElement): void {
  for (const layout of Array.from(root.querySelectorAll<HTMLElement>('.exe-layout-2-cols, .exe-layout-3-cols, .exe-layout-4-cols'))) {
    const columns = Array.from(layout.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && /\bexe-col\b/.test(child.className),
    );
    if (columns.length < 2) {
      continue;
    }

    const doc = layout.ownerDocument;
    const table = doc.createElement('table');
    const tbody = doc.createElement('tbody');
    const row = doc.createElement('tr');
    table.append(tbody);
    tbody.append(row);

    for (const column of columns) {
      const cell = doc.createElement('td');
      while (column.firstChild) {
        cell.append(column.firstChild);
      }
      row.append(cell);
    }

    layout.replaceWith(table);
  }
}

function normalizePdfTables(root: HTMLElement): void {
  for (const table of Array.from(root.querySelectorAll<HTMLTableElement>('table'))) {
    const firstRow = table.querySelector('tr');
    if (!firstRow) {
      continue;
    }

    const cells = Array.from(firstRow.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && /^(td|th)$/i.test(child.tagName),
    );
    if (cells.length === 0) {
      continue;
    }

    const widths = cells.map(cell => readPercentWidth(cell));
    const tinyColumns = widths.filter(width => width !== null && width <= 8);
    if (tinyColumns.length === 0) {
      continue;
    }

    stripTableWidths(table);
  }
}

function normalizeLeadingInlineImages(root: HTMLElement): void {
  for (const paragraph of Array.from(root.querySelectorAll<HTMLElement>('p, li, dd'))) {
    const nodes = Array.from(paragraph.childNodes).filter(node => !isIgnorableInlineWhitespace(node));
    if (nodes.length < 2) {
      continue;
    }

    const first = nodes[0];
    if (!(first instanceof HTMLImageElement) || !isSmallInlineImage(first)) {
      continue;
    }

    const doc = paragraph.ownerDocument;
    const imageParagraph = doc.createElement('p');
    const clonedImage = first.cloneNode(true);
    imageParagraph.append(clonedImage);

    first.remove();
    paragraph.parentNode?.insertBefore(imageParagraph, paragraph);
  }
}

function normalizeLargePdfImages(root: HTMLElement): void {
  for (const image of Array.from(root.querySelectorAll<HTMLImageElement>('img'))) {
    if (isSmallInlineImage(image)) {
      continue;
    }

    const width = Number.parseInt(image.getAttribute('width') || '', 10) || image.width || 0;
    if (width <= 0) {
      continue;
    }

    if (width > 500) {
      image.setAttribute('width', '500');
    }

    image.removeAttribute('height');

    const style = (image.getAttribute('style') || '').trim();
    const cleaned = style
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .filter(part => !/^width\s*:/i.test(part) && !/^height\s*:/i.test(part))
      .join('; ');

    if (cleaned) {
      image.setAttribute('style', cleaned);
    } else {
      image.removeAttribute('style');
    }
  }
}

function isSmallInlineImage(image: HTMLImageElement): boolean {
  const width = Number.parseInt(image.getAttribute('width') || '', 10) || image.width || 0;
  const height = Number.parseInt(image.getAttribute('height') || '', 10) || image.height || 0;
  return Math.max(width, height) > 0 && Math.max(width, height) <= 96;
}

function stripTableWidths(table: HTMLTableElement): void {
  stripWidthDeclarations(table);
  for (const element of Array.from(table.querySelectorAll<HTMLElement>('tr, td, th, col, colgroup, tbody, thead, tfoot, p, span, div'))) {
    stripWidthDeclarations(element);
  }
}

function stripWidthDeclarations(element: HTMLElement): void {
  element.removeAttribute('width');

  const style = (element.getAttribute('style') || '').trim();
  if (!style) {
    return;
  }

  const cleaned = style
    .split(';')
    .map(part => part.trim())
    .filter(Boolean)
    .filter(part => !/^width\s*:/i.test(part))
    .join('; ');

  if (cleaned) {
    element.setAttribute('style', cleaned);
  } else {
    element.removeAttribute('style');
  }
}

function readPercentWidth(element: HTMLElement): number | null {
  const style = (element.getAttribute('style') || '').trim();
  const styleMatch = style.match(/(?:^|;)\s*width\s*:\s*([\d.]+)%/i);
  if (styleMatch) {
    return Number.parseFloat(styleMatch[1]);
  }

  const widthAttr = (element.getAttribute('width') || '').trim();
  if (/^[\d.]+%$/.test(widthAttr)) {
    return Number.parseFloat(widthAttr.slice(0, -1));
  }

  return null;
}

function normalizeLooseImageCaptions(root: HTMLElement): void {
  for (const container of Array.from(root.querySelectorAll<HTMLElement>('div, section, article'))) {
    if (container.querySelector(':scope > figure')) {
      continue;
    }

    const children = Array.from(container.childNodes).filter(node => !isIgnorableInlineWhitespace(node));
    if (children.length < 2) {
      continue;
    }

    const imageBlockIndex = children.findIndex(node => node instanceof HTMLElement && isImageOnlyBlock(node));
    if (imageBlockIndex < 0 || imageBlockIndex === children.length - 1) {
      continue;
    }

    const captionNodes = children.slice(imageBlockIndex + 1);
    if (captionNodes.length === 0 || !captionNodes.every(isLooseCaptionNode)) {
      continue;
    }

    const imageBlock = children[imageBlockIndex] as HTMLElement;
    const doc = container.ownerDocument;
    const figure = doc.createElement('figure');
    const figcaption = doc.createElement('figcaption');

    const image = imageBlock.querySelector('img');
    if (image) {
      figure.append(image);
    } else {
      while (imageBlock.firstChild) {
        figure.append(imageBlock.firstChild);
      }
    }

    for (const node of captionNodes) {
      figcaption.append(node);
    }

    collapseCaptionContent(figcaption);
    figure.append(figcaption);
    imageBlock.replaceWith(figure);
  }
}

function normalizePdfCaptions(root: HTMLElement): void {
  for (const caption of Array.from(root.querySelectorAll<HTMLElement>('figcaption, .figcaption'))) {
    collapseCaptionContent(caption);
  }
}

function isImageOnlyBlock(node: HTMLElement): boolean {
  const tag = node.tagName.toLowerCase();
  if (!['p', 'div'].includes(tag)) {
    return false;
  }

  const meaningfulChildren = Array.from(node.childNodes).filter(child => {
    if (child instanceof Text) {
      return normalizeWhitespace(child.textContent || '').length > 0;
    }
    return child instanceof HTMLElement && child.tagName.toLowerCase() !== 'br';
  });

  if (meaningfulChildren.length !== 1) {
    return false;
  }

  const onlyChild = meaningfulChildren[0];
  if (!(onlyChild instanceof HTMLElement)) {
    return false;
  }

  return onlyChild.tagName.toLowerCase() === 'img';
}

function isLooseCaptionNode(node: Node): boolean {
  if (node instanceof Text) {
    const text = normalizeWhitespace(node.textContent || '').replace(/\u00a0/g, ' ').trim();
    return ['.', '(', ')'].includes(text) || text.length > 0;
  }

  if (!(node instanceof HTMLElement)) {
    return false;
  }

  const tag = node.tagName.toLowerCase();
  if (tag === 'br') {
    return true;
  }

  if (tag === 'a') {
    return true;
  }

  if (tag === 'span') {
    const className = (node.getAttribute('class') || '').toLowerCase();
    return /\b(author|title|license|sep|figcaption)\b/.test(className) || normalizeWhitespace(node.textContent || '').length > 0;
  }

  return false;
}

function collapseCaptionContent(caption: HTMLElement): void {
  const text = normalizeCaptionText(caption.textContent || '');
  if (!text) {
    caption.remove();
    return;
  }

  caption.textContent = text;
}

function normalizeCaptionText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function normalizeSplitInlineWords(root: HTMLElement): void {
  for (const parent of Array.from(root.querySelectorAll<HTMLElement>('p, li, dd, figcaption, span, div'))) {
    const children = Array.from(parent.childNodes);
    for (let index = 1; index < children.length; index += 1) {
      const current = children[index];
      const previous = children[index - 1];

      if (!(current instanceof HTMLElement) || !(previous instanceof Text)) {
        continue;
      }

      const firstTextNode = findFirstTextNode(current);
      if (!firstTextNode) {
        continue;
      }

      const previousText = previous.nodeValue || '';
      const currentText = firstTextNode.nodeValue || '';
      const previousMatch = previousText.match(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)$/u);
      const currentMatch = currentText.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)/u);

      if (!previousMatch || !currentMatch) {
        continue;
      }

      const trailingToken = previousMatch[1];
      if (!trailingToken || /\s$/.test(previousText.slice(0, previousText.length - trailingToken.length))) {
        continue;
      }

      previous.nodeValue = previousText.slice(0, previousText.length - trailingToken.length);
      firstTextNode.nodeValue = `${trailingToken}${currentText}`;
    }
  }
}

function findFirstTextNode(root: Node): Text | null {
  if (root instanceof Text) {
    return root;
  }

  for (const child of Array.from(root.childNodes)) {
    const match = findFirstTextNode(child);
    if (match && (match.nodeValue || '').length > 0) {
      return match;
    }
  }

  return null;
}

function ensurePdfMakeFonts(): void {
  if (pdfMakeInitialized) {
    return;
  }

  pdfMake.addVirtualFileSystem(pdfFonts);
  pdfMake.fonts = {
    Roboto: {
      normal: 'Roboto-Regular.ttf',
      bold: 'Roboto-Medium.ttf',
      italics: 'Roboto-Italic.ttf',
      bolditalics: 'Roboto-MediumItalic.ttf',
    },
  };
  pdfMakeInitialized = true;
}

export async function inspectElpxPages(file: File): Promise<ElpxPageInfo[]> {
  const input = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(input);
  const project = parseProject(entries);
  return project.pages.map(page => ({
    id: page.id,
    parentId: page.parentId,
    title: page.title,
    depth: page.depth,
  }));
}

async function buildCompatibleDocx(htmlDocument: string): Promise<Blob> {
  const htmlDoc = new DOMParser().parseFromString(htmlDocument, 'text/html');
  const children = convertContainerChildrenToDocxBlocks(htmlDoc.body);

  if (children.length === 0) {
    children.push(new Paragraph({ text: 'El proyecto no contiene contenido exportable.' }));
  }

  const sections: ISectionOptions[] = [{ children }];
  const document = new DocxDocument({ sections });
  return Packer.toBlob(document);
}

async function buildDocxPreviewHtml(blob: Blob, title: string, language: string): Promise<string> {
  try {
    const result = await mammoth.convertToHtml(
      { arrayBuffer: await blob.arrayBuffer() },
      {
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        ignoreEmptyParagraphs: false,
      },
    );

    return `<!doctype html>
<html lang="${escapeAttribute(language || 'es')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title || 'Vista previa DOCX')}</title>
  <style>
    html, body { margin: 0; padding: 0; background: #f5f5f5; }
    body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
    .docx-preview {
      box-sizing: border-box;
      width: min(900px, 100%);
      margin: 0 auto;
      padding: 24px;
      background: #fff;
      column-count: 1 !important;
      column-gap: 0 !important;
    }
    .docx-preview * {
      box-sizing: border-box;
      max-width: 100%;
      column-count: initial;
    }
    .docx-preview table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    .docx-preview td, .docx-preview th { border: 1px solid #c8c8c8; padding: 6px; vertical-align: top; }
    .docx-preview img { height: auto; }
  </style>
</head>
<body>
  <main class="docx-preview">
    ${result.value || '<p>No se pudo generar la vista previa del DOCX.</p>'}
  </main>
</body>
</html>`;
  } catch {
    return '<!doctype html><html lang="es"><body><p>No se pudo generar la vista previa del DOCX.</p></body></html>';
  }
}

function buildMathEnabledSourcePreviewHtml(htmlDocument: string, title: string, language: string): string {
  const parsed = new DOMParser().parseFromString(htmlDocument, 'text/html');
  for (const script of Array.from(parsed.querySelectorAll('script'))) {
    script.remove();
  }
  for (const link of Array.from(parsed.querySelectorAll('link[rel="stylesheet"]'))) {
    link.remove();
  }
  const bodyHtml = parsed.body?.innerHTML || '<p>Sin contenido para previsualizar.</p>';

  return `<!doctype html>
<html lang="${escapeAttribute(language || 'es')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title || 'Vista previa DOCX')}</title>
  <style>
    html, body { margin: 0; padding: 0; background: #f5f5f5; }
    body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
    .docx-preview {
      box-sizing: border-box;
      width: min(900px, 100%);
      margin: 0 auto;
      padding: 24px;
      background: #fff;
      column-count: 1 !important;
      column-gap: 0 !important;
    }
    .docx-preview * { box-sizing: border-box; max-width: 100%; }
    .docx-preview table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    .docx-preview td, .docx-preview th { border: 1px solid #c8c8c8; padding: 6px; vertical-align: top; }
    .docx-preview img { height: auto; }
  </style>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
        displayMath: [['\\\\[', '\\\\]'], ['$$', '$$']],
        processEscapes: true
      },
      svg: { fontCache: 'global' }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
</head>
<body>
  <main class="docx-preview">
    ${bodyHtml}
  </main>
</body>
</html>`;
}

function parseProject(entries: Record<string, Uint8Array>): ParsedProject {
  const contentEntry = entries['content.xml'];
  if (!contentEntry) {
    throw new Error('No se ha encontrado content.xml. Esta versión inicial solo soporta ELPX modernos de eXeLearning 4.');
  }

  const xml = decodeUtf8(contentEntry);
  const xmlDoc = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('El content.xml no se ha podido interpretar correctamente.');
  }

  const title = findPropertyValue(xmlDoc, 'pp_title') || 'eXeLearning';
  const subtitle = findPropertyValue(xmlDoc, 'pp_subtitle') || '';
  const language = findPropertyValue(xmlDoc, 'pp_lang') || 'es';
  const navStructures = Array.from(xmlDoc.getElementsByTagName('odeNavStructure'));

  const pages = navStructures
    .map(node => parsePageNode(node))
    .filter((page): page is ParsedPage => page !== null);

  return {
    title,
    subtitle,
    language,
    pages: sortPagesHierarchically(pages),
  };
}

function parsePageNode(node: Element): ParsedPage | null {
  const id = getDirectText(node, 'odePageId');
  if (!id) {
    return null;
  }

  const title = getDirectText(node, 'pageName') || 'Página sin título';
  const parentId = normalizeNullable(getDirectText(node, 'odeParentPageId'));
  const order = Number.parseInt(getDirectText(node, 'odeNavStructureOrder') || '0', 10) || 0;
  const pageStructures = getDirectChildren(node, 'odePagStructures')
    .flatMap(group => getDirectChildren(group, 'odePagStructure'))
    .sort((a, b) => getOrder(a, 'odePagStructureOrder') - getOrder(b, 'odePagStructureOrder'));

  const fragments: string[] = [];
  for (const pageStructure of pageStructures) {
    const components = getDirectChildren(pageStructure, 'odeComponents')
      .flatMap(group => getDirectChildren(group, 'odeComponent'))
      .sort((a, b) => getOrder(a, 'odeComponentsOrder') - getOrder(b, 'odeComponentsOrder'));

    for (const component of components) {
      const htmlView = getDirectText(component, 'htmlView');
      if (htmlView) {
        fragments.push(htmlView);
      }
    }
  }

  return {
    id,
    parentId,
    title,
    order,
    depth: 1,
    contentHtml: fragments.join('\n'),
  };
}

async function buildHtmlDocument(
  sourceProject: ParsedProject,
  scopedProject: ParsedProject,
  assets: Map<string, AssetEntry>,
  entries: Record<string, Uint8Array>,
): Promise<string> {
  const exportedPagesById = (await extractRenderedExportedPageFragments(entries)) || extractExportedPageFragments(entries);
  const sourceIndexById = new Map(sourceProject.pages.map((page, index) => [page.id, index]));
  const exportedPagesInSourceOrder = sourceProject.pages.map(page => exportedPagesById?.get(page.id) || '');
  const sections = scopedProject.pages
    .map(page => {
      const sourceIndex = sourceIndexById.get(page.id);
      const originalHtml = page.contentHtml || '';
      const renderedHtml =
        exportedPagesById?.get(page.id) || (typeof sourceIndex === 'number' ? (exportedPagesInSourceOrder[sourceIndex] || '') : '');
      const sourceHtml = choosePreferredPageSource(originalHtml, renderedHtml);
      const content = sanitizeHtmlFragment(sourceHtml, assets, page.depth);
      if (!content.trim()) {
        return '';
      }

      const pageHeadingTag = `h${clampHeadingLevel(page.depth)}`;
      return `<section class="page">
<${pageHeadingTag}>${escapeHtml(page.title)}</${pageHeadingTag}>
${content}
</section>`;
    })
    .filter(Boolean)
    .join('\n');

  return `<!doctype html>
<html lang="${escapeAttribute(scopedProject.language)}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(scopedProject.title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
    h1 { font-size: 24pt; margin: 0 0 10pt; }
    h1, h2, h3, h4, h5, h6 { margin: 24pt 0 10pt; padding-bottom: 4pt; border-bottom: 1pt solid #d7d0c2; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; }
    h4 { font-size: 13pt; }
    h5 { font-size: 12pt; }
    h6 { font-size: 11pt; }
    p, li { font-size: 11pt; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    td, th { border: 1pt solid #bfb7a8; padding: 4pt 6pt; vertical-align: top; }
    .project-subtitle { color: #5a544a; margin: 0 0 14pt; }
    .sr-av, .js-hidden, .screen-reader-text { display: none !important; }
  </style>
</head>
<body>
  <h1>${escapeHtml(scopedProject.title)}</h1>
  ${scopedProject.subtitle ? `<p class="project-subtitle">${escapeHtml(scopedProject.subtitle)}</p>` : ''}
  ${sections || '<p>El proyecto no contiene contenido exportable.</p>'}
</body>
</html>`;
}

function choosePreferredPageSource(originalHtml: string, renderedHtml: string): string {
  if (hasMeaningfulPageSource(originalHtml)) {
    return originalHtml;
  }

  if (hasMeaningfulPageSource(renderedHtml)) {
    return renderedHtml;
  }

  return originalHtml || renderedHtml;
}

function hasMeaningfulPageSource(html: string): boolean {
  if (!html.trim()) {
    return false;
  }

  if (
    /\\\(|\\\[|\$\$|\$[^$\s]/.test(html) ||
    /\\begin\{(?:equation\*?|align\*?|aligned|gather\*?|array|matrix|pmatrix|bmatrix|vmatrix|Vmatrix)\}/i.test(html)
  ) {
    return true;
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  if (template.content.querySelector('iframe, object, embed')) {
    return true;
  }

  for (const removable of Array.from(template.content.querySelectorAll('script, style, noscript, iframe, object, embed'))) {
    removable.remove();
  }

  for (const hidden of Array.from(template.content.querySelectorAll<HTMLElement>('*'))) {
    if (shouldDropHiddenElement(hidden)) {
      hidden.remove();
    }
  }

  if (
    template.content.querySelector(
      'img, svg, table, math, mjx-container, figure, ul, ol, dl, blockquote, h1, h2, h3, h4, h5, h6, pre',
    )
  ) {
    return true;
  }

  const text = normalizeWhitespace(template.content.textContent || '');
  return text.length >= 24;
}

function scopeProjectToSelection(project: ParsedProject, selectedPageIds?: string[]): ParsedProject {
  if (!selectedPageIds || selectedPageIds.length === 0) {
    return project;
  }

  const selectedSet = new Set(selectedPageIds);
  const scopedPages = project.pages
    .filter(page => selectedSet.has(page.id))
    .map(page => ({
      ...page,
      parentId: page.parentId && selectedSet.has(page.parentId) ? page.parentId : null,
      depth: 1,
    }));

  return {
    ...project,
    pages: sortPagesHierarchically(scopedPages),
  };
}

async function extractRenderedExportedPageFragments(entries: Record<string, Uint8Array>): Promise<Map<string, string> | null> {
  if (!entries['index.html']) {
    return null;
  }

  const orderedPaths = getExportedHtmlPagePaths(entries);
  const fragments = new Map<string, string>();

  for (const path of orderedPaths) {
    const entry = entries[path];
    if (!entry) {
      continue;
    }

    try {
      const html = decodeUtf8(entry);
      const pageId = extractExportedPageId(html);
      const rendered = await renderExportedPageContent(path, html, entries);
      if (pageId && rendered.trim()) {
        fragments.set(pageId, rendered);
      }
    } catch {
      return null;
    }
  }

  return fragments.size > 0 ? fragments : null;
}

function extractExportedPageFragments(entries: Record<string, Uint8Array>): Map<string, string> | null {
  if (!entries['index.html']) {
    return null;
  }

  const orderedPaths = getExportedHtmlPagePaths(entries);
  const fragments = new Map<string, string>();

  for (const path of orderedPaths) {
    const entry = entries[path];
    if (!entry) {
      continue;
    }

    const html = decodeUtf8(entry);
    const pageId = extractExportedPageId(html);
    const fragment = extractExportedPageContent(html);
    if (pageId && fragment.trim()) {
      fragments.set(pageId, fragment);
    }
  }

  return fragments.size > 0 ? fragments : null;
}

function extractExportedPageId(html: string): string | null {
  const match = html.match(/\bid=["']exe-(page-[A-Za-z0-9_-]+)["']/i);
  return match?.[1] || null;
}

function getExportedHtmlPagePaths(entries: Record<string, Uint8Array>): string[] {
  const ordered = new Set<string>();
  ordered.add('index.html');

  const indexHtml = decodeUtf8(entries['index.html']);
  const indexDoc = new DOMParser().parseFromString(indexHtml, 'text/html');
  for (const anchor of Array.from(indexDoc.querySelectorAll<HTMLAnchorElement>('#siteNav a[href]'))) {
    const href = (anchor.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#') || /^(?:javascript:|https?:)/i.test(href)) {
      continue;
    }

    const normalized = normalizeAssetPath(href);
    if (entries[normalized]) {
      ordered.add(normalized);
    }
  }

  if (ordered.size === 1) {
    for (const path of Object.keys(entries)
      .filter(path => /^html\/.+\.html$/i.test(path))
      .sort()) {
      ordered.add(path);
    }
  }

  return Array.from(ordered);
}

function extractExportedPageContent(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const main = doc.querySelector('main.page') || doc.querySelector('main') || doc.body;
  const clone = main.cloneNode(true) as HTMLElement;

  for (const removable of Array.from(
    clone.querySelectorAll(
      [
        '#exe-client-search',
        '#siteNav',
        'nav',
        'script',
        '.box-head',
        '.box-toggle',
        '#nodeDecoration',
        '#packageLicense',
        '#made-with-eXe',
        '.pagination',
        '#topPagination',
        '#bottomPagination',
        '#nodeTitle',
        '#nodeSubTitle',
      ].join(', '),
    ),
  )) {
    removable.remove();
  }

  const boxContents = Array.from(clone.querySelectorAll<HTMLElement>('article.box > .box-content'));
  if (boxContents.length > 0) {
    return boxContents.map(box => box.innerHTML.trim()).filter(Boolean).join('\n');
  }

  return clone.innerHTML.trim();
}

async function renderExportedPageContent(
  pagePath: string,
  html: string,
  entries: Record<string, Uint8Array>,
): Promise<string> {
  const preparedHtml = inlineExportedPageResources(pagePath, html, entries);

  return new Promise<string>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = '1280px';
    iframe.style.height = '900px';
    iframe.style.opacity = '0';
    document.body.appendChild(iframe);

    let settled = false;

    const cleanup = () => {
      iframe.remove();
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    iframe.addEventListener(
      'load',
      () => {
        window.setTimeout(() => {
          try {
            const doc = iframe.contentDocument;
            if (!doc) {
              fail(new Error('No se ha podido acceder al documento renderizado.'));
              return;
            }

            freezeCanvasElements(doc);
            const content = extractExportedPageContent(doc.documentElement.outerHTML);
            if (settled) {
              return;
            }
            settled = true;
            cleanup();
            resolve(content);
          } catch (error) {
            fail(error instanceof Error ? error : new Error(String(error)));
          }
        }, 700);
      },
      { once: true },
    );

    iframe.srcdoc = preparedHtml;

    window.setTimeout(() => {
      if (!settled) {
        fail(new Error('Tiempo de espera agotado al renderizar la página exportada.'));
      }
    }, 4000);
  });
}

function inlineExportedPageResources(pagePath: string, html: string, entries: Record<string, Uint8Array>): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  for (const script of Array.from(doc.querySelectorAll<HTMLScriptElement>('script'))) {
    script.remove();
  }

  for (const link of Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]'))) {
    const href = link.getAttribute('href') || '';
    const resolved = resolveEntryPathFromDocument(pagePath, href);
    if (!resolved || !entries[resolved]) {
      link.remove();
      continue;
    }

    const style = doc.createElement('style');
    style.textContent = inlineCssAsset(resolved, entries);
    link.replaceWith(style);
  }

  for (const element of Array.from(doc.querySelectorAll<HTMLElement>('[src], [href], [poster]'))) {
    for (const attributeName of ['src', 'href', 'poster']) {
      const rawValue = element.getAttribute(attributeName);
      if (!rawValue) {
        continue;
      }

      const resolved = resolveEntryPathFromDocument(pagePath, rawValue);
      if (!resolved || !entries[resolved]) {
        continue;
      }

      element.setAttribute(attributeName, toDataUrl({
        zipPath: resolved,
        data: entries[resolved],
        mime: getMimeType(resolved),
      }));
    }
  }

  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

function inlineCssAsset(cssPath: string, entries: Record<string, Uint8Array>): string {
  const css = decodeUtf8(entries[cssPath]);
  const cssDir = dirnamePath(cssPath);

  return css.replace(/url\((['"]?)([^'")]+)\1\)/gi, (full, _quote: string, rawUrl: string) => {
    const resolved = resolveEntryPathFromDocument(cssDir, rawUrl);
    if (!resolved || !entries[resolved]) {
      return full;
    }

    const dataUrl = toDataUrl({
      zipPath: resolved,
      data: entries[resolved],
      mime: getMimeType(resolved),
    });
    return `url("${dataUrl}")`;
  });
}

function resolveEntryPathFromDocument(basePath: string, rawValue: string): string | null {
  const cleaned = rawValue.trim();
  if (!cleaned || cleaned.startsWith('data:') || cleaned.startsWith('#') || /^(?:javascript:|https?:)?\/\//i.test(cleaned)) {
    return null;
  }

  const pathOnly = cleaned.replace(/[?#].*$/, '');
  const segments = basePath.split('/').filter(Boolean);
  if (segments.length > 0 && !basePath.endsWith('/')) {
    segments.pop();
  }

  for (const segment of pathOnly.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..') {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return normalizeAssetPath(segments.join('/'));
}

function dirnamePath(value: string): string {
  const normalized = normalizeAssetPath(value);
  const lastSlash = normalized.lastIndexOf('/');
  if (lastSlash === -1) {
    return '';
  }
  return normalized.slice(0, lastSlash + 1);
}

function freezeCanvasElements(doc: Document): void {
  for (const canvas of Array.from(doc.querySelectorAll('canvas'))) {
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const image = doc.createElement('img');
      image.setAttribute('src', dataUrl);
      image.setAttribute('width', String(canvas.width || canvas.clientWidth || 1));
      image.setAttribute('height', String(canvas.height || canvas.clientHeight || 1));
      image.setAttribute('alt', 'Contenido renderizado');
      canvas.replaceWith(image);
    } catch {
      canvas.remove();
    }
  }
}

async function renderLatexInHtml(contentHtml: string): Promise<string> {
  if (!containsLatex(contentHtml)) {
    return contentHtml;
  }

  const htmlDoc = new DOMParser().parseFromString(`<body>${contentHtml}</body>`, 'text/html');
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(htmlDoc.body, NodeFilter.SHOW_TEXT);

  while (walker.nextNode()) {
    const current = walker.currentNode;
    if (current instanceof Text) {
      textNodes.push(current);
    }
  }

  for (const textNode of textNodes) {
    const source = textNode.nodeValue || '';
    const parts = await splitTextWithRenderedLatex(source);
    if (!parts) {
      continue;
    }

    const fragment = htmlDoc.createDocumentFragment();
    for (const part of parts) {
      if (typeof part === 'string') {
        if (part) {
          fragment.appendChild(htmlDoc.createTextNode(part));
        }
        continue;
      }

      const image = htmlDoc.createElement('img');
      image.setAttribute('src', part.dataUrl);
      image.setAttribute('alt', part.alt);
      image.setAttribute('width', String(part.width));
      image.setAttribute('height', String(part.height));
      image.setAttribute('data-latex-rendered', 'true');
      fragment.appendChild(image);
    }

    textNode.replaceWith(fragment);
  }

  return htmlDoc.body.innerHTML;
}

function containsLatex(value: string): boolean {
  return /\\\(|\\\[|\$\$|\$[^$\s]/.test(value);
}

async function splitTextWithRenderedLatex(
  value: string,
): Promise<Array<string | { dataUrl: string; alt: string; width: number; height: number }> | null> {
  const regex = /\\\((.+?)\\\)|\\\[(.+?)\\\]|\$\$(.+?)\$\$|\$([^$\n]+)\$/g;
  const matches = Array.from(value.matchAll(regex));
  if (matches.length === 0) {
    return null;
  }

  const parts: Array<string | { dataUrl: string; alt: string; width: number; height: number }> = [];
  let lastIndex = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const before = value.slice(lastIndex, start);
    if (before) {
      parts.push(before);
    }

    const expression = (match[1] ?? match[2] ?? match[3] ?? match[4] ?? '').trim();
    const displayMode = Boolean(match[2] || match[3]);
    if (!expression) {
      parts.push(match[0]);
    } else {
      const rendered = await renderLatexToPngDataUrl(expression, displayMode);
      parts.push({
        dataUrl: rendered.dataUrl,
        alt: expression,
        width: rendered.width,
        height: rendered.height,
      });
    }

    lastIndex = start + match[0].length;
  }

  const after = value.slice(lastIndex);
  if (after) {
    parts.push(after);
  }

  return parts;
}

async function renderLatexToPngDataUrl(
  expression: string,
  display: boolean,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const cacheKey = `${display ? 'block' : 'inline'}:${expression}`;
  const cached = latexRenderCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const mathJax = await ensureMathJaxReady();
    const renderedNode = await mathJax.tex2svgPromise(expression, { display });
    const svg = renderedNode.querySelector('svg');
    if (!svg) {
      throw new Error(`No se ha podido renderizar la fórmula: ${expression}`);
    }

    const svgMarkup = new XMLSerializer().serializeToString(svg);
    return svgToPngDataUrl(svgMarkup);
  })();

  latexRenderCache.set(cacheKey, promise);
  return promise;
}

async function ensureMathJaxReady(): Promise<MathJaxApi> {
  const win = window as Window & { __elpxDocxMathJaxPromise?: Promise<MathJaxApi>; MathJax?: MathJaxGlobal };

  if (win.__elpxDocxMathJaxPromise) {
    return win.__elpxDocxMathJaxPromise;
  }

  win.__elpxDocxMathJaxPromise = new Promise<MathJaxApi>((resolve, reject) => {
    if (win.MathJax?.tex2svgPromise) {
      resolve(win.MathJax as MathJaxApi);
      return;
    }

    win.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)'], ['$', '$']],
        displayMath: [['\\[', '\\]'], ['$$', '$$']],
      },
      svg: {
        fontCache: 'none',
      },
      startup: {
        ready: () => {
          const runtime = win.MathJax;
          runtime?.startup?.defaultReady?.();
          if (runtime?.tex2svgPromise) {
            resolve(runtime as MathJaxApi);
          } else {
            reject(new Error('MathJax no expone tex2svgPromise.'));
          }
        },
      },
    } as MathJaxGlobal;

    const existing = document.querySelector<HTMLScriptElement>('script[data-mathjax-loader="execonvert"]');
    if (existing) {
      existing.addEventListener('error', () => reject(new Error('No se ha podido cargar MathJax.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
    script.async = true;
    script.dataset.mathjaxLoader = 'execonvert';
    script.onerror = () => reject(new Error('No se ha podido cargar MathJax desde el CDN.'));
    document.head.appendChild(script);
  });

  return win.__elpxDocxMathJaxPromise;
}

async function svgToPngDataUrl(svgMarkup: string): Promise<{ dataUrl: string; width: number; height: number }> {
  const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml' });
  const objectUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(objectUrl);
    const width = Math.max(1, Math.round(image.naturalWidth || 1));
    const height = Math.max(1, Math.round(image.naturalHeight || 1));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('No se ha podido crear el contexto canvas para renderizar LaTeX.');
    }

    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('No se ha podido rasterizar la fórmula.'));
      }, 'image/png');
    });

    const dataUrl = await blobToDataUrl(pngBlob);
    return { dataUrl, width, height };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se ha podido cargar la imagen renderizada.'));
    image.src = src;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se ha podido leer la imagen renderizada.'));
    reader.readAsDataURL(blob);
  });
}

function convertHtmlToDocxBlocks(contentHtml: string): Array<Paragraph | Table> {
  if (!contentHtml.trim()) {
    return [];
  }

  const htmlDoc = new DOMParser().parseFromString(`<body>${contentHtml}</body>`, 'text/html');
  const body = htmlDoc.body;
  const blocks: Array<Paragraph | Table> = [];
  let orderedListIndex = 1;

  for (const node of Array.from(body.childNodes)) {
    blocks.push(...convertBlockNode(node, { listDepth: 0, listType: null, orderedIndex: orderedListIndex }));

    if (node instanceof HTMLOListElement) {
      orderedListIndex += Array.from(node.children).filter(child => child.tagName === 'LI').length;
    } else {
      orderedListIndex = 1;
    }
  }

  return blocks;
}

function convertContainerChildrenToDocxBlocks(container: ParentNode): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [];
  let orderedListIndex = 1;

  for (const node of Array.from(container.childNodes)) {
    if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'section') {
      blocks.push(...convertContainerChildrenToDocxBlocks(node));
      orderedListIndex = 1;
      continue;
    }

    blocks.push(...convertBlockNode(node, { listDepth: 0, listType: null, orderedIndex: orderedListIndex }));

    if (node instanceof HTMLOListElement) {
      orderedListIndex += Array.from(node.children).filter(child => child.tagName === 'LI').length;
    } else {
      orderedListIndex = 1;
    }
  }

  return blocks;
}

function convertBlockNode(
  node: Node,
  context: { listDepth: number; listType: 'ul' | 'ol' | null; orderedIndex: number },
): Array<Paragraph | Table> {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeWhitespace(node.textContent || '');
    return text ? [new Paragraph({ children: [new TextRun(text)] })] : [];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  const tag = node.tagName.toLowerCase();

  if (tag === 'figure') {
    return convertFigureBlock(node, context);
  }

  if (tag === 'dl') {
    return convertDefinitionList(node);
  }

  if (tag === 'dt') {
    const label = normalizeWhitespace(node.textContent || '');
    if (!label) {
      return [];
    }

    return [
      new Paragraph({
        children: [new TextRun({ text: label, bold: true })],
        spacing: { before: 120, after: 80 },
      }),
    ];
  }

  if (isCaptionLikeContainer(node, tag)) {
    const children = inlineChildrenFromNode(node);
    if (children.length === 0) {
      return [];
    }
    return [
      new Paragraph({
        children,
        spacing: { after: 120 },
      }),
    ];
  }

  if (isStructuralBlockContainer(tag)) {
    const nestedBlocks: Array<Paragraph | Table> = [];
    let orderedListIndex = 1;
    let inlineBuffer: ParagraphChild[] = [];
    const alignment = getParagraphAlignment(node);

    const flushInlineBuffer = () => {
      if (inlineBuffer.length === 0) {
        return;
      }

      nestedBlocks.push(
        new Paragraph({
          alignment,
          children: inlineBuffer,
          spacing: { after: 120 },
        }),
      );
      inlineBuffer = [];
    };

    for (const child of Array.from(node.childNodes)) {
      if (isIgnorableInlineWhitespace(child)) {
        continue;
      }

      if (isInlineFlowNode(child)) {
        inlineBuffer.push(...inlineChildrenFromNode(child));
        continue;
      }

      flushInlineBuffer();
      nestedBlocks.push(...convertBlockNode(child, { listDepth: context.listDepth, listType: null, orderedIndex: orderedListIndex }));

      if (child instanceof HTMLOListElement) {
        orderedListIndex += Array.from(child.children).filter(grandChild => grandChild.tagName === 'LI').length;
      } else {
        orderedListIndex = 1;
      }
    }

    flushInlineBuffer();
    return nestedBlocks;
  }

  if (tag === 'table') {
    return [convertTable(node)];
  }

  if (tag === 'ul' || tag === 'ol') {
    const items: Array<Paragraph | Table> = [];
    let itemIndex = 1;

    for (const child of Array.from(node.children)) {
      if (child.tagName.toLowerCase() !== 'li') {
        continue;
      }

      items.push(...convertListItem(child, tag as 'ul' | 'ol', context.listDepth, itemIndex));
      itemIndex += 1;
    }

    return items;
  }

  if (tag === 'li') {
    return convertListItem(node, context.listType || 'ul', context.listDepth, context.orderedIndex);
  }

  const heading = getHeadingLevel(tag);
  const paragraphChildren = inlineChildrenFromNode(node);
  const alignment = getParagraphAlignment(node);

  if (tag === 'hr') {
    return [new Paragraph({ text: ' ' })];
  }

  if (paragraphChildren.length === 0) {
    if (tag === 'p' && containsExplicitLineBreak(node)) {
      return [
        new Paragraph({
          text: '',
          alignment,
          spacing: { after: 120 },
        }),
      ];
    }

    const text = normalizeWhitespace(node.textContent || '');
    if (!text) {
      return [];
    }
    paragraphChildren.push(new TextRun(text));
  }

  return [
    new Paragraph({
      heading,
      alignment,
      children: paragraphChildren,
      spacing: { after: tag.startsWith('h') ? 180 : 120 },
    }),
  ];
}

function isStructuralBlockContainer(tag: string): boolean {
  return ['div', 'article', 'main', 'header', 'footer', 'dd'].includes(tag);
}

function isInlineFlowNode(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeWhitespace(node.textContent || '').length > 0;
  }

  if (!(node instanceof HTMLElement)) {
    return false;
  }

  const tag = node.tagName.toLowerCase();
  if (tag === 'img') {
    return false;
  }

  if (isCaptionLikeContainer(node, tag)) {
    return false;
  }

  if (isStructuralBlockContainer(tag)) {
    return false;
  }

  if (getHeadingLevel(tag)) {
    return false;
  }

  return !['p', 'table', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'figure', 'blockquote', 'pre', 'hr'].includes(tag);
}

function isIgnorableInlineWhitespace(node: Node): boolean {
  return node.nodeType === Node.TEXT_NODE && normalizeWhitespace(node.textContent || '').length === 0;
}

function isCaptionLikeContainer(node: HTMLElement, tag: string): boolean {
  if (tag === 'figcaption' || tag === 'caption') {
    return true;
  }

  const className = (node.getAttribute('class') || '').toLowerCase();
  return /\bfigcaption\b/.test(className);
}

function containsExplicitLineBreak(node: HTMLElement): boolean {
  return node.querySelector('br') !== null;
}

function getParagraphAlignment(node: HTMLElement) {
  const style = (node.getAttribute('style') || '').toLowerCase();
  const alignMatch = style.match(/text-align\s*:\s*(left|right|center|justify)/i);
  const align = alignMatch?.[1] || '';

  if (align === 'center') {
    return AlignmentType.CENTER;
  }

  if (align === 'right') {
    return AlignmentType.RIGHT;
  }

  if (align === 'justify') {
    return AlignmentType.JUSTIFIED;
  }

  if (align === 'left') {
    return AlignmentType.LEFT;
  }

  const inferred = inferImageAlignment(node);
  if (inferred) {
    return inferred;
  }

  return undefined;
}

function inferImageAlignment(node: HTMLElement) {
  const directImages = Array.from(node.children).filter((child): child is HTMLImageElement => child instanceof HTMLImageElement);
  const nestedImage =
    directImages.length === 1
      ? directImages[0]
      : node.children.length === 1 && node.firstElementChild instanceof HTMLImageElement
        ? node.firstElementChild
        : null;

  if (!nestedImage || !isBlockLikeImage(nestedImage)) {
    return undefined;
  }

  const style = (nestedImage.getAttribute('style') || '').toLowerCase();
  const hasAutoLeft = /margin-left\s*:\s*auto/.test(style);
  const hasAutoRight = /margin-right\s*:\s*auto/.test(style);

  if (hasAutoLeft && hasAutoRight) {
    return AlignmentType.CENTER;
  }

  if (hasAutoLeft) {
    return AlignmentType.RIGHT;
  }

  if (hasAutoRight) {
    return AlignmentType.LEFT;
  }

  return undefined;
}

function convertFigureBlock(
  node: HTMLElement,
  context: { listDepth: number; listType: 'ul' | 'ol' | null; orderedIndex: number },
): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [];

  for (const child of Array.from(node.childNodes)) {
    blocks.push(...convertBlockNode(child, context));
  }

  return blocks;
}

function convertDefinitionList(node: HTMLElement): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [];

  for (const child of Array.from(node.children)) {
    const tag = child.tagName.toLowerCase();

    if (tag === 'dt') {
      blocks.push(
        ...convertBlockNode(child, {
          listDepth: 0,
          listType: null,
          orderedIndex: 1,
        }),
      );
      continue;
    }

    if (tag === 'dd') {
      if (child instanceof HTMLElement) {
        blocks.push(...convertDefinitionBody(child));
      }
      continue;
    }
  }

  return blocks;
}

function convertDefinitionBody(node: HTMLElement): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [];
  let orderedListIndex = 1;

  for (const child of Array.from(node.childNodes)) {
    if (child instanceof Text) {
      const text = normalizeWhitespace(child.textContent || '');
      if (text) {
        blocks.push(
          new Paragraph({
            children: [new TextRun(text)],
            spacing: { after: 120 },
          }),
        );
      }
      continue;
    }

    blocks.push(...convertBlockNode(child, { listDepth: 0, listType: null, orderedIndex: orderedListIndex }));

    if (child instanceof HTMLOListElement) {
      orderedListIndex += Array.from(child.children).filter(grandChild => grandChild.tagName === 'LI').length;
    } else {
      orderedListIndex = 1;
    }
  }

  return blocks;
}

function convertListItem(
  node: Element,
  listType: 'ul' | 'ol',
  listDepth: number,
  itemIndex: number,
): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = [];
  const prefix = listType === 'ol' ? `${itemIndex}. ` : `${'  '.repeat(listDepth)}• `;

  const inlineNodes = Array.from(node.childNodes).filter(
    child => !(child instanceof HTMLElement) || !['ul', 'ol', 'table'].includes(child.tagName.toLowerCase()),
  );
  const paragraphChildren = inlineNodes.flatMap(child => inlineChildrenFromNode(child));

  if (paragraphChildren.length > 0) {
    blocks.push(
      new Paragraph({
        children: [new TextRun(prefix), ...paragraphChildren],
        spacing: { after: 80 },
      }),
    );
  }

  for (const child of Array.from(node.children)) {
    const tag = child.tagName.toLowerCase();
    if (!['ul', 'ol', 'table'].includes(tag)) {
      continue;
    }

    blocks.push(
      ...convertBlockNode(child, {
        listDepth: listDepth + 1,
        listType: tag === 'ul' || tag === 'ol' ? (tag as 'ul' | 'ol') : listType,
        orderedIndex: 1,
      }),
    );
  }

  return blocks;
}

function convertTable(tableElement: HTMLElement): Table {
  const rows = Array.from(tableElement.querySelectorAll('tr')).map(
    row =>
      new TableRow({
        children: Array.from(row.children)
          .filter(cell => ['td', 'th'].includes(cell.tagName.toLowerCase()))
          .map(
            cell =>
              new TableCell({
                width: { size: 100 / Math.max(1, row.children.length), type: WidthType.PERCENTAGE },
                children: buildTableCellChildren(cell),
              }),
          ),
      }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows:
      rows.length > 0
        ? rows
        : [new TableRow({ children: [new TableCell({ children: [new Paragraph({ text: '' })] })] })],
  });
}

function buildTableCellChildren(cell: Element): Paragraph[] {
  const children: Paragraph[] = [];
  const directElements = Array.from(cell.childNodes);

  for (const child of directElements) {
    if (child instanceof HTMLTableElement) {
      continue;
    }

    if (child instanceof HTMLElement && ['p', 'div', 'ul', 'ol', 'li'].includes(child.tagName.toLowerCase())) {
      children.push(...convertBlockNode(child, { listDepth: 0, listType: null, orderedIndex: 1 }).filter(isParagraph));
      continue;
    }

    const runs = inlineChildrenFromNode(child);
    if (runs.length > 0) {
      children.push(new Paragraph({ children: runs }));
    }
  }

  if (children.length === 0) {
    children.push(new Paragraph({ text: normalizeWhitespace(cell.textContent || '') || '' }));
  }

  return children;
}

function isParagraph(block: Paragraph | Table): block is Paragraph {
  return block instanceof Paragraph;
}

function inlineChildrenFromNode(node: Node, style: InlineStyle = {}): ParagraphChild[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return parseInlineText(node.textContent || '', style);
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  const tag = node.tagName.toLowerCase();
  const nextStyle = { ...style };

  if (tag === 'strong' || tag === 'b') {
    nextStyle.bold = true;
  }
  if (tag === 'em' || tag === 'i') {
    nextStyle.italics = true;
  }
  if (tag === 'u') {
    nextStyle.underline = {};
  }
  if (tag === 'code') {
    nextStyle.font = 'Courier New';
  }

  if (tag === 'br') {
    return [new TextRun({ break: 1, ...style })];
  }

  if (tag === 'img') {
    const imageRun = buildImageRun(node);
    if (imageRun) {
      if (isBlockLikeImage(node)) {
        return [new TextRun({ break: 1 }), imageRun, new TextRun({ break: 1 })];
      }

      return [imageRun];
    }

    const alt = node.getAttribute('alt') || 'Imagen';
    return [new TextRun({ text: `[${alt}]`, ...style })];
  }

  if (tag === 'a') {
    const href = (node.getAttribute('href') || '').trim();
    const linkStyle = { ...nextStyle, underline: {}, color: '0563C1' };
    const children = Array.from(node.childNodes).flatMap(child => inlineChildrenFromNode(child, linkStyle));

    if (href && !href.startsWith('#')) {
      return [
        new ExternalHyperlink({
          link: href,
          children:
            children.length > 0
              ? children
              : [new TextRun({ text: normalizeWhitespace(node.textContent || '') || href, ...linkStyle })],
        }),
      ];
    }

    const label = normalizeWhitespace(node.textContent || '') || href || 'Enlace';
    return [new TextRun({ text: label, ...linkStyle })];
  }

  if (['ul', 'ol', 'table'].includes(tag)) {
    return [];
  }

  const runs: ParagraphChild[] = [];
  for (const child of Array.from(node.childNodes)) {
    runs.push(...inlineChildrenFromNode(child, nextStyle));
  }

  if (runs.length === 0) {
    const text = preserveBasicWhitespace(node.textContent || '');
    if (text) {
      runs.push(...parseInlineText(text, nextStyle));
    }
  }

  return runs;
}

function buildImageRun(node: HTMLElement): ImageRun | null {
  const src = node.getAttribute('src') || '';
  if (!src.startsWith('data:')) {
    return null;
  }

  const parsed = parseDataUrlImage(src);
  if (!parsed) {
    return null;
  }

  const width = clampImageDimension(Number.parseInt(node.getAttribute('width') || '', 10) || parsed.width || 200);
  const height = clampImageDimension(Number.parseInt(node.getAttribute('height') || '', 10) || parsed.height || 60);

  if (parsed.mime === 'image/svg+xml') {
    return null;
  }

  const imageType = getDocxImageType(parsed.mime);
  if (!imageType) {
    return null;
  }

  return new ImageRun({
    type: imageType,
    data: parsed.data,
    transformation: {
      width,
      height,
    },
  });
}

function isBlockLikeImage(node: HTMLElement): boolean {
  const style = (node.getAttribute('style') || '').toLowerCase();
  const className = (node.getAttribute('class') || '').toLowerCase();

  if (style.includes('display: block')) {
    return true;
  }

  if (style.includes('margin-left: auto') || style.includes('margin-right: auto')) {
    return true;
  }

  if (className.includes('block')) {
    return true;
  }

  const parent = node.parentElement;
  if (!parent) {
    return false;
  }

  const tag = parent.tagName.toLowerCase();
  return tag === 'figure';
}

function parseDataUrlImage(dataUrl: string): RenderedImageData | null {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) {
    return null;
  }

  const mime = match[1] || 'application/octet-stream';
  const isBase64 = Boolean(match[2]);
  const rawData = match[3] || '';
  const decoded = isBase64 ? decodeBase64(rawData) : new TextEncoder().encode(decodeURIComponent(rawData));

  const dimensions =
    mime === 'image/png'
      ? readPngDimensions(decoded)
      : mime === 'image/svg+xml'
        ? readSvgDimensions(new TextDecoder().decode(decoded))
        : null;

  return {
    data: decoded,
    mime,
    width: dimensions?.width || 0,
    height: dimensions?.height || 0,
  };
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const result = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    result[index] = binary.charCodeAt(index);
  }

  return result;
}

function readPngDimensions(data: Uint8Array): { width: number; height: number } | null {
  if (data.length < 24) {
    return null;
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    width: view.getUint32(16),
    height: view.getUint32(20),
  };
}

function readSvgDimensions(markup: string): { width: number; height: number } | null {
  const widthMatch = markup.match(/\bwidth="([\d.]+)(px)?"/i);
  const heightMatch = markup.match(/\bheight="([\d.]+)(px)?"/i);
  if (widthMatch && heightMatch) {
    return {
      width: Math.round(Number.parseFloat(widthMatch[1])),
      height: Math.round(Number.parseFloat(heightMatch[1])),
    };
  }

  const viewBoxMatch = markup.match(/\bviewBox="[\d.\s-]+ ([\d.]+) ([\d.]+)"/i);
  if (viewBoxMatch) {
    return {
      width: Math.round(Number.parseFloat(viewBoxMatch[1])),
      height: Math.round(Number.parseFloat(viewBoxMatch[2])),
    };
  }

  return null;
}

function clampImageDimension(value: number): number {
  return Math.max(1, Math.min(600, Math.round(value)));
}

function getDocxImageType(mime: string): 'jpg' | 'png' | 'gif' | 'bmp' | null {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/bmp':
      return 'bmp';
    default:
      return null;
  }
}

function parseInlineText(value: string, style: InlineStyle): ParagraphChild[] {
  const normalized = normalizeInlineWhitespace(value);
  if (!normalized) {
    return [];
  }

  const parts: ParagraphChild[] = [];
  const regex =
    /\\begin\{equation\*?\}([\s\S]+?)\\end\{equation\*?\}|\\\(([\s\S]+?)\\\)|\\\[([\s\S]+?)\\\]|\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$/g;
  let lastIndex = 0;

  for (const match of normalized.matchAll(regex)) {
    const start = match.index ?? 0;
    const before = normalized.slice(lastIndex, start);
    if (before) {
      parts.push(new TextRun({ text: before, ...style }));
    }

    const expression = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? '';
    const displayMode = Boolean(match[1] || match[3] || match[4]);
    if (expression.trim()) {
      const sanitizedExpression = sanitizeLatexMathExpression(expression);
      const renderedMath = buildLatexMathComponent(sanitizedExpression, displayMode);
      if (renderedMath) {
        parts.push(renderedMath);
      } else {
        parts.push(new DocxMath({ children: parseLatexExpression(sanitizedExpression) }));
      }
    } else {
      parts.push(new TextRun({ text: match[0], ...style }));
    }

    lastIndex = start + match[0].length;
  }

  const after = normalized.slice(lastIndex);
  if (after) {
    parts.push(new TextRun({ text: after, ...style }));
  }

  return parts.length > 0 ? parts : [new TextRun({ text: normalized, ...style })];
}

function sanitizeLatexMathExpression(expression: string): string {
  return expression
    .replace(/\\label\{[^}]*\}/g, ' ')
    .replace(/\\nonumber\b/g, ' ')
    .replace(/(^|[^\\])ext\{/g, '$1\\text{')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildLatexMathComponent(expression: string, displayMode: boolean): ParagraphChild | null {
  try {
    const mathMl = temml.renderToString(expression.trim(), {
      displayMode,
      strict: false,
      xml: true,
      throwOnError: false,
    } as {
      displayMode: boolean;
      strict: boolean;
      xml: boolean;
      throwOnError: boolean;
    });

    if (!mathMl.startsWith('<math')) {
      return null;
    }

    const omml = mml2omml(mathMl);
    if (!omml.includes('<m:oMath')) {
      return null;
    }

    const imported = ImportedXmlComponent.fromXmlString(omml) as ImportedXmlComponent & {
      rootKey?: string;
      root?: ParagraphChild[];
    };

    if (imported.rootKey) {
      return imported as unknown as ParagraphChild;
    }

    const firstChild = imported.root?.[0];
    return firstChild ?? null;
  } catch {
    return null;
  }
}

function parseLatexExpression(expression: string): MathComponent[] {
  const normalized = expression.trim();
  const wrapped = unwrapLeftRightPair(normalized);
  const source = wrapped?.inner ?? normalized;
  const parser = new LatexMathParser(source);
  const parsed = parser.parseSequence();
  const base = parsed.length > 0 ? parsed : [new MathRun(source)];

  if (!wrapped) {
    return base;
  }

  switch (wrapped.kind) {
    case 'round':
      return [new OMathDelimited(base, '(', ')') as unknown as MathComponent];
    case 'square':
      return [new OMathDelimited(base, '[', ']') as unknown as MathComponent];
    case 'curly':
      return [new OMathDelimited(base, '{', '}') as unknown as MathComponent];
    case 'vertical':
      return [new OMathDelimited(base, '|', '|') as unknown as MathComponent];
    default:
      return base;
  }
}

function unwrapLeftRightPair(
  expression: string,
): { inner: string; kind: 'round' | 'square' | 'curly' | 'vertical' } | null {
  const trimmed = expression.trim();
  const pairs = [
    { start: '\\left(', end: '\\right)', kind: 'round' as const },
    { start: '\\left[', end: '\\right]', kind: 'square' as const },
    { start: '\\left\\{', end: '\\right\\}', kind: 'curly' as const },
    { start: '\\left|', end: '\\right|', kind: 'vertical' as const },
  ];

  for (const pair of pairs) {
    if (trimmed.startsWith(pair.start) && trimmed.endsWith(pair.end)) {
      return {
        inner: trimmed.slice(pair.start.length, trimmed.length - pair.end.length).trim(),
        kind: pair.kind,
      };
    }
  }

  return null;
}

class LatexMathParser {
  private source: string;
  private index: number;

  constructor(source: string) {
    this.source = source;
    this.index = 0;
  }

  parseSequence(stopChars: string[] = []): MathComponent[] {
    const result: MathComponent[] = [];

    while (!this.isAtEnd()) {
      this.skipWhitespace();

      const current = this.peek();
      if (!current) {
        break;
      }

      if (stopChars.includes(current)) {
        break;
      }

      const atom = this.parseAtom();
      if (atom.length === 0) {
        this.index += 1;
        continue;
      }

      result.push(...atom);
    }

    return result;
  }

  private parseAtom(): MathComponent[] {
    const base = this.parsePrimary();
    if (base.length === 0) {
      return [];
    }

    let subScript: MathComponent[] | null = null;
    let superScript: MathComponent[] | null = null;

    while (!this.isAtEnd()) {
      this.skipWhitespace();
      const current = this.peek();

      if (current === '_') {
        this.index += 1;
        subScript = this.parseScriptArgument();
        continue;
      }

      if (current === '^') {
        this.index += 1;
        superScript = this.parseScriptArgument();
        continue;
      }

      break;
    }

    if (subScript && superScript) {
      return [
        new MathSubSuperScript({
          children: base,
          subScript,
          superScript,
        }),
      ];
    }

    if (subScript) {
      return [
        new MathSubScript({
          children: base,
          subScript,
        }),
      ];
    }

    if (superScript) {
      return [
        new MathSuperScript({
          children: base,
          superScript,
        }),
      ];
    }

    return base;
  }

  private parsePrimary(): MathComponent[] {
    const current = this.peek();
    if (!current) {
      return [];
    }

    if (current === '{') {
      this.index += 1;
      const group = this.parseSequence(['}']);
      this.consume('}');
      return group;
    }

    if (current === '(') {
      this.index += 1;
      const inner = this.parseSequence([')']);
      this.consume(')');
      return [new MathRun('('), ...inner, new MathRun(')')];
    }

    if (current === '[') {
      this.index += 1;
      const inner = this.parseSequence([']']);
      this.consume(']');
      return [new MathRun('['), ...inner, new MathRun(']')];
    }

    if (current === '\\') {
      return this.parseCommand();
    }

    if (/\d/.test(current)) {
      return [new MathRun(this.readWhile(char => /[\d.,]/.test(char)))];
    }

    if (/[A-Za-z]/.test(current)) {
      this.index += 1;
      return [new MathRun(current)];
    }

    this.index += 1;
    return [new MathRun(current)];
  }

  private parseCommand(): MathComponent[] {
    this.consume('\\');

    const next = this.peek();
    if (!next) {
      return [new MathRun('\\')];
    }

    if (!/[A-Za-z]/.test(next)) {
      this.index += 1;
      return [new MathRun(this.decodeEscapedCharacter(next))];
    }

    const command = this.readWhile(char => /[A-Za-z]/.test(char));

    if (command === 'frac') {
      const numerator = this.parseRequiredGroup();
      const denominator = this.parseRequiredGroup();
      return [
        new MathFraction({
          numerator,
          denominator,
        }),
      ];
    }

    if (command === 'sqrt') {
      const degree = this.peek() === '[' ? this.parseBracketArgument() : undefined;
      const children = this.parseRequiredGroup();
      return [
        new MathRadical({
          children,
          degree,
        }),
      ];
    }

    if (command === 'left' || command === 'right') {
      this.skipWhitespace();
      const delimiter = this.parsePrimary();
      return delimiter;
    }

    if (command === 'begin') {
      return this.parseEnvironment();
    }

    if (command === 'text' || command === 'mathrm' || command === 'operatorname') {
      return [new MathRun(this.readTextArgument())];
    }

    const symbol = LATEX_COMMAND_SYMBOLS[command];
    if (symbol) {
      return [new MathRun(symbol)];
    }

    const greek = LATEX_GREEK_SYMBOLS[command];
    if (greek) {
      return [new MathRun(greek)];
    }

    if (command === 'LaTeX') {
      return [new MathRun('LaTeX')];
    }

    return [new MathRun(command)];
  }

  private parseEnvironment(): MathComponent[] {
    const environmentName = this.readTextArgument();
    if (!environmentName) {
      return [new MathRun('begin')];
    }

    if (!MATRIX_ENVIRONMENTS.has(environmentName)) {
      return [new MathRun(environmentName)];
    }

    this.skipWhitespace();
    if (environmentName === 'array' && this.peek() === '{') {
      this.readTextArgument();
      this.skipWhitespace();
    }

    const content = this.readUntilEnvironmentEnd(environmentName);
    const matrix = buildLatexMatrix(content);

    switch (environmentName) {
      case 'pmatrix':
        return [new OMathDelimited([matrix as unknown as MathComponent], '(', ')') as unknown as MathComponent];
      case 'bmatrix':
        return [new OMathDelimited([matrix as unknown as MathComponent], '[', ']') as unknown as MathComponent];
      case 'Bmatrix':
        return [new OMathDelimited([matrix as unknown as MathComponent], '{', '}') as unknown as MathComponent];
      case 'vmatrix':
        return [new OMathDelimited([matrix as unknown as MathComponent], '|', '|') as unknown as MathComponent];
      default:
        return [matrix as unknown as MathComponent];
    }
  }

  private readUntilEnvironmentEnd(environmentName: string): string {
    const endToken = `\\end{${environmentName}}`;
    const beginToken = `\\begin{${environmentName}}`;
    let depth = 1;
    let cursor = this.index;

    while (cursor < this.source.length) {
      if (this.source.startsWith(beginToken, cursor)) {
        depth += 1;
        cursor += beginToken.length;
        continue;
      }

      if (this.source.startsWith(endToken, cursor)) {
        depth -= 1;
        if (depth === 0) {
          const content = this.source.slice(this.index, cursor);
          this.index = cursor + endToken.length;
          return content;
        }
        cursor += endToken.length;
        continue;
      }

      cursor += 1;
    }

    const fallback = this.source.slice(this.index);
    this.index = this.source.length;
    return fallback;
  }

  private parseRequiredGroup(): MathComponent[] {
    this.skipWhitespace();

    if (this.peek() === '{') {
      this.index += 1;
      const group = this.parseSequence(['}']);
      this.consume('}');
      return group.length > 0 ? group : [new MathRun('')];
    }

    return this.parsePrimary();
  }

  private parseBracketArgument(): MathComponent[] {
    this.skipWhitespace();

    if (this.peek() !== '[') {
      return [new MathRun('')];
    }

    this.index += 1;
    const group = this.parseSequence([']']);
    this.consume(']');
    return group.length > 0 ? group : [new MathRun('')];
  }

  private parseScriptArgument(): MathComponent[] {
    this.skipWhitespace();

    if (this.peek() === '{') {
      this.index += 1;
      const group = this.parseSequence(['}']);
      this.consume('}');
      return group.length > 0 ? group : [new MathRun('')];
    }

    const atom = this.parseAtom();
    return atom.length > 0 ? atom : [new MathRun('')];
  }

  private readTextArgument(): string {
    this.skipWhitespace();

    if (this.peek() !== '{') {
      return '';
    }

    this.index += 1;
    let depth = 1;
    let result = '';

    while (!this.isAtEnd() && depth > 0) {
      const current = this.peek();
      this.index += 1;

      if (current === '{') {
        depth += 1;
        result += current;
        continue;
      }

      if (current === '}') {
        depth -= 1;
        if (depth > 0) {
          result += current;
        }
        continue;
      }

      if (current === '\\') {
        const escaped = this.peek();
        if (escaped) {
          if (/[A-Za-z]/.test(escaped)) {
            const command = this.readWhile(char => /[A-Za-z]/.test(char));
            result += LATEX_COMMAND_SYMBOLS[command] || LATEX_GREEK_SYMBOLS[command] || command;
          } else {
            this.index += 1;
            result += this.decodeEscapedCharacter(escaped);
          }
          continue;
        }
      }

      result += current;
    }

    return normalizeWhitespace(result);
  }

  private decodeEscapedCharacter(value: string): string {
    switch (value) {
      case '{':
      case '}':
      case '_':
      case '^':
      case '%':
      case '#':
      case '&':
      case '$':
      case '[':
      case ']':
        return value;
      case '\\':
        return '\\';
      default:
        return value;
    }
  }

  private readWhile(predicate: (value: string) => boolean): string {
    let result = '';

    while (!this.isAtEnd()) {
      const current = this.peek();
      if (!current || !predicate(current)) {
        break;
      }

      result += current;
      this.index += 1;
    }

    return result;
  }

  private skipWhitespace(): void {
    while (!this.isAtEnd() && /\s/.test(this.peek() || '')) {
      this.index += 1;
    }
  }

  private consume(expected: string): void {
    if (this.peek() === expected) {
      this.index += 1;
    }
  }

  private peek(): string | null {
    return this.source[this.index] ?? null;
  }

  private isAtEnd(): boolean {
    return this.index >= this.source.length;
  }
}

class OMathMatrix extends XmlComponent {
  constructor(rows: MathComponent[][][]) {
    super('m:m');
    const columnCount = Math.max(1, ...rows.map(row => row.length));
    this.addChildElement(new OMathMatrixProperties(columnCount));

    for (const row of rows) {
      this.addChildElement(new OMathMatrixRow(row));
    }
  }
}

class OMathDelimited extends XmlComponent {
  constructor(children: MathComponent[], beginningCharacter: string, endingCharacter: string) {
    super('m:d');
    this.addChildElement(new OMathDelimiterProperties(beginningCharacter, endingCharacter));
    this.addChildElement(new OMathMatrixCell(children));
  }
}

class OMathDelimiterProperties extends XmlComponent {
  constructor(beginningCharacter: string, endingCharacter: string) {
    super('m:dPr');
    this.addChildElement(
      new BuilderElement({
        name: 'm:begChr',
        attributes: {
          character: { key: 'm:val', value: beginningCharacter },
        },
      }),
    );
    this.addChildElement(
      new BuilderElement({
        name: 'm:endChr',
        attributes: {
          character: { key: 'm:val', value: endingCharacter },
        },
      }),
    );
    this.addChildElement(new OMathControlProperties());
  }
}

class OMathMatrixProperties extends XmlComponent {
  constructor(columnCount: number) {
    super('m:mPr');
    this.addChildElement(
      new BuilderElement({
        name: 'm:mcs',
        children: [
          new BuilderElement({
            name: 'm:mc',
            children: [
              new BuilderElement({
                name: 'm:mcPr',
                children: [
                  new BuilderElement({
                    name: 'm:count',
                    attributes: {
                      value: { key: 'm:val', value: String(columnCount) },
                    },
                  }),
                  new BuilderElement({
                    name: 'm:mcJc',
                    attributes: {
                      value: { key: 'm:val', value: 'center' },
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
    this.addChildElement(new OMathControlProperties());
  }
}

class OMathMatrixRow extends XmlComponent {
  constructor(cells: MathComponent[][]) {
    super('m:mr');

    for (const cell of cells) {
      this.addChildElement(new OMathMatrixCell(cell));
    }
  }
}

class OMathMatrixCell extends XmlComponent {
  constructor(children: MathComponent[]) {
    super('m:e');
    const safeChildren = children.length > 0 ? children : [new MathRun('')];
    for (const child of safeChildren) {
      this.addChildElement(child as unknown as XmlComponent);
    }
    this.addChildElement(new OMathControlProperties());
  }
}

class OMathControlProperties extends XmlComponent {
  constructor() {
    super('m:ctrlPr');
    this.addChildElement(
      new BuilderElement({
        name: 'w:rPr',
        children: [
          new BuilderElement({
            name: 'w:rFonts',
            attributes: {
              ascii: { key: 'w:ascii', value: 'Cambria Math' },
              eastAsia: { key: 'w:eastAsia', value: 'Cambria Math' },
              hAnsi: { key: 'w:hAnsi', value: 'Cambria Math' },
              cs: { key: 'w:cs', value: 'Cambria Math' },
            },
          }),
        ],
      }),
    );
  }
}

function buildLatexMatrix(raw: string): OMathMatrix {
  const rowStrings = splitLatexTopLevel(raw, '\\\\').map(value => value.trim()).filter(Boolean);
  const rows = rowStrings.map(rowString =>
    splitLatexTopLevel(rowString, '&').map(cellString => {
      const cell = new LatexMathParser(cellString).parseSequence();
      return cell.length > 0 ? cell : [new MathRun('')];
    }),
  );

  if (rows.length === 0) {
    return new OMathMatrix([[[new MathRun('')]]]);
  }

  return new OMathMatrix(rows);
}

function splitLatexTopLevel(source: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  let index = 0;

  while (index < source.length) {
    const current = source[index];

    if (current === '{') {
      depth += 1;
      index += 1;
      continue;
    }

    if (current === '}') {
      depth = Math.max(0, depth - 1);
      index += 1;
      continue;
    }

    if (depth === 0 && source.startsWith(separator, index)) {
      parts.push(source.slice(start, index));
      index += separator.length;
      start = index;
      continue;
    }

    index += 1;
  }

  parts.push(source.slice(start));
  return parts;
}

const MATRIX_ENVIRONMENTS = new Set([
  'array',
  'matrix',
  'pmatrix',
  'bmatrix',
  'Bmatrix',
  'vmatrix',
  'Vmatrix',
  'aligned',
  'align',
  'align*',
  'cases',
  'gathered',
  'split',
]);

const LATEX_GREEK_SYMBOLS: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ϵ',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  varphi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Xi: 'Ξ',
  Pi: 'Π',
  Sigma: 'Σ',
  Upsilon: 'Υ',
  Phi: 'Φ',
  Psi: 'Ψ',
  Omega: 'Ω',
};

const LATEX_COMMAND_SYMBOLS: Record<string, string> = {
  cdot: '·',
  times: '×',
  div: '÷',
  pm: '±',
  mp: '∓',
  neq: '≠',
  ne: '≠',
  leq: '≤',
  le: '≤',
  geq: '≥',
  ge: '≥',
  approx: '≈',
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  leftrightarrow: '↔',
  infty: '∞',
  sum: '∑',
  int: '∫',
  partial: '∂',
  degree: '°',
  angle: '∠',
  forall: '∀',
  exists: '∃',
  in: '∈',
  notin: '∉',
  subset: '⊂',
  subseteq: '⊆',
  superset: '⊃',
  superseteq: '⊇',
  cup: '∪',
  cap: '∩',
  land: '∧',
  lor: '∨',
  neg: '¬',
  ldots: '…',
  cdots: '⋯',
  dots: '…',
  percent: '%',
};

function getHeadingLevel(tagName: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  switch (tagName) {
    case 'h1':
      return HeadingLevel.HEADING_1;
    case 'h2':
      return HeadingLevel.HEADING_2;
    case 'h3':
      return HeadingLevel.HEADING_3;
    case 'h4':
      return HeadingLevel.HEADING_4;
    case 'h5':
      return HeadingLevel.HEADING_5;
    case 'h6':
      return HeadingLevel.HEADING_6;
    default:
      return undefined;
  }
}

function sanitizeHtmlFragment(sourceHtml: string, assets: Map<string, AssetEntry>, pageDepth = 1): string {
  if (!sourceHtml.trim()) {
    return '';
  }

  const template = document.createElement('template');
  template.innerHTML = sourceHtml;
  replaceEmbeddedResourceElements(template.content, assets);
  revealExportableHiddenSections(template.content);
  template.innerHTML = rewriteAssetReferences(template.innerHTML, assets);

  for (const element of Array.from(template.content.querySelectorAll('*'))) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.startsWith('on')) {
        element.removeAttribute(attribute.name);
      }
    }

    element.removeAttribute('id');
    element.removeAttribute('contenteditable');
  }

  for (const removable of Array.from(
    template.content.querySelectorAll('script, noscript, iframe, button, form, input, select, textarea'),
  )) {
    removable.remove();
  }

  for (const hidden of Array.from(template.content.querySelectorAll<HTMLElement>('*'))) {
    if (shouldDropHiddenElement(hidden)) {
      hidden.remove();
    }
  }

  for (const candidate of Array.from(template.content.querySelectorAll<HTMLElement>('div, img, a, p'))) {
    if (shouldRemovePrintExtraElement(candidate)) {
      candidate.remove();
    }
  }

  for (const details of Array.from(template.content.querySelectorAll('details'))) {
    details.setAttribute('open', 'open');
  }

  for (const anchor of Array.from(template.content.querySelectorAll('a'))) {
    const href = anchor.getAttribute('href') || '';
    const normalizedHref = href.trim().toLowerCase();
    if (href.startsWith('asset://')) {
      anchor.replaceWith(document.createTextNode(anchor.textContent || anchor.getAttribute('download') || 'Adjunto'));
      continue;
    }

    if (normalizedHref.startsWith('data:')) {
      const label = anchor.textContent?.trim() || anchor.getAttribute('download') || 'Adjunto';
      anchor.replaceWith(document.createTextNode(label));
      continue;
    }

    if (href.startsWith('exe-node:')) {
      anchor.removeAttribute('href');
      continue;
    }

    if (/^(?:javascript:|#)/i.test(href)) {
      anchor.removeAttribute('href');
    }
  }

  for (const image of Array.from(template.content.querySelectorAll('img'))) {
    const src = image.getAttribute('src') || '';
    const alt = (image.getAttribute('alt') || '').trim();

    if (!src && /^\\[imagen\\]$/i.test(alt)) {
      image.remove();
      continue;
    }

    if (/^(https?:)?\/\//i.test(src)) {
      const label = image.getAttribute('alt') || 'Imagen externa omitida';
      image.replaceWith(document.createTextNode(label));
      continue;
    }

    if (!src.startsWith('data:') && !src.startsWith('asset://')) {
      image.removeAttribute('src');
    }
  }

  for (const media of Array.from(template.content.querySelectorAll('audio, video'))) {
    const source = media.getAttribute('src') || media.querySelector('source')?.getAttribute('src') || '';
    const replacement = document.createElement('p');
    replacement.textContent = describeOmittedMedia(source);
    media.replaceWith(replacement);
  }

  flattenFxBlocks(template.content);

  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const current = walker.currentNode;
    if (current instanceof Text) {
      textNodes.push(current);
    }
  }

  for (const textNode of textNodes) {
    const source = textNode.nodeValue || '';
    const sanitized = sanitizeEmbeddedDataText(source);
    if (sanitized !== source) {
      textNode.nodeValue = sanitized;
    }
  }

  normalizeHeadingLevels(template.content, pageDepth);

  return template.innerHTML.trim();
}

function revealExportableHiddenSections(root: DocumentFragment): void {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>('.feedback, .js-feedback'))) {
    element.classList.remove('js-hidden');
    element.removeAttribute('hidden');

    const style = (element.getAttribute('style') || '').trim();
    if (!style) {
      continue;
    }

    const normalized = style
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .filter(part => !/^display\s*:\s*none$/i.test(part) && !/^visibility\s*:\s*hidden$/i.test(part))
      .join('; ');

    if (normalized) {
      element.setAttribute('style', normalized);
    } else {
      element.removeAttribute('style');
    }
  }
}

function replaceEmbeddedResourceElements(root: DocumentFragment, assets: Map<string, AssetEntry>): void {
  for (const element of Array.from(root.querySelectorAll<HTMLElement>('iframe, object, embed'))) {
    element.replaceWith(buildEmbeddedResourcePlaceholder(element, assets));
  }
}

function buildEmbeddedResourcePlaceholder(element: HTMLElement, assets: Map<string, AssetEntry>): HTMLElement {
  const source = getEmbeddedResourceSource(element);
  const doc = element.ownerDocument;
  const placeholder = doc.createElement('p');
  const kind = classifyEmbeddedResource(source);
  const label = getEmbeddedResourceLabel(kind);
  const title = getEmbeddedResourceTitle(element, source);
  const resolvedSource = resolveEmbeddedResourceLink(source, assets);

  placeholder.className = `embedded-resource embedded-resource-${kind}`;

  const strong = doc.createElement('strong');
  strong.textContent = `${label}:`;
  placeholder.append(strong, ' ');

  if (title) {
    const titleSpan = doc.createElement('span');
    titleSpan.textContent = title;
    placeholder.append(titleSpan);
  }

  if (resolvedSource?.href) {
    if (title) {
      placeholder.append(' ');
    }
    const link = doc.createElement('a');
    link.setAttribute('href', resolvedSource.href);
    link.textContent = resolvedSource.label;
    placeholder.append(link);
    return placeholder;
  }

  if (resolvedSource?.label && resolvedSource.label !== title) {
    if (title) {
      placeholder.append(' ');
    }
    const reference = doc.createElement('span');
    reference.textContent = resolvedSource.label;
    placeholder.append(reference);
    return placeholder;
  }

  if (!title) {
    placeholder.append('Recurso no disponible');
  }

  return placeholder;
}

function getEmbeddedResourceSource(element: HTMLElement): string {
  if (element instanceof HTMLObjectElement) {
    return (element.getAttribute('data') || '').trim();
  }

  return (
    element.getAttribute('src') ||
    element.getAttribute('data') ||
    element.querySelector('source')?.getAttribute('src') ||
    ''
  ).trim();
}

function classifyEmbeddedResource(source: string): 'pdf' | 'video' | 'genially' | 'canva' | 'web' | 'resource' {
  const normalized = source.toLowerCase();
  if (!normalized) return 'resource';
  if (normalized.includes('genially.com')) return 'genially';
  if (normalized.includes('canva.com')) return 'canva';
  if (/\b(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)\b/.test(normalized)) return 'video';
  if (normalized.endsWith('.pdf') || normalized.includes('/pdf/')) return 'pdf';
  if (/^https?:\/\//.test(normalized)) return 'web';
  return 'resource';
}

function getEmbeddedResourceLabel(kind: 'pdf' | 'video' | 'genially' | 'canva' | 'web' | 'resource'): string {
  switch (kind) {
    case 'pdf':
      return 'PDF incrustado';
    case 'video':
      return 'Video incrustado';
    case 'genially':
      return 'Genially incrustado';
    case 'canva':
      return 'Canva incrustado';
    case 'web':
      return 'Recurso web incrustado';
    default:
      return 'Recurso incrustado';
  }
}

function getEmbeddedResourceTitle(element: HTMLElement, source: string): string {
  const candidates = [
    element.getAttribute('title'),
    element.getAttribute('aria-label'),
    element.getAttribute('name'),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeWhitespace(candidate || '');
    if (normalized) {
      return normalized;
    }
  }

  if (!source) {
    return '';
  }

  if (/^https?:\/\//i.test(source)) {
    return '';
  }

  const path = source.replace(/^.*\//, '');
  return path ? decodeURIComponent(path) : '';
}

function resolveEmbeddedResourceLink(
  source: string,
  assets: Map<string, AssetEntry>,
): { href?: string; label: string } | null {
  if (!source) {
    return null;
  }

  if (/^https?:\/\//i.test(source)) {
    return { href: source, label: source };
  }

  const normalized = normalizeAssetPath(source.replace(/^\{\{context_path\}\}\//, ''));
  if (assets.has(normalized)) {
    return { label: normalized.split('/').pop() || normalized };
  }

  return { label: normalized.split('/').pop() || normalized || source };
}

function shouldDropHiddenElement(element: HTMLElement): boolean {
  if (element.hasAttribute('hidden')) {
    return true;
  }

  const ariaHidden = (element.getAttribute('aria-hidden') || '').trim().toLowerCase();
  if (ariaHidden === 'true') {
    return true;
  }

  const style = (element.getAttribute('style') || '').toLowerCase();
  if (/display\s*:\s*none/.test(style) || /visibility\s*:\s*hidden/.test(style)) {
    return true;
  }

  const className = (element.getAttribute('class') || '').toLowerCase();
  if (!className) {
    return false;
  }

  return /\b(js-hidden|sr-av|screen-reader-text|visually-hidden)\b/.test(className);
}

function flattenFxBlocks(root: DocumentFragment): void {
  for (const fxBlock of Array.from(root.querySelectorAll<HTMLElement>('.exe-fx'))) {
    const fragment = document.createDocumentFragment();
    let pendingText = '';

    const flushText = () => {
      const text = normalizeWhitespace(pendingText);
      if (!text) {
        pendingText = '';
        return;
      }

      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      fragment.appendChild(paragraph);
      pendingText = '';
    };

    for (const child of Array.from(fxBlock.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        pendingText += ` ${child.textContent || ''}`;
        continue;
      }

      if (!(child instanceof HTMLElement)) {
        continue;
      }

      const tag = child.tagName.toLowerCase();
      if (/^h[1-6]$/.test(tag)) {
        flushText();
        const headingParagraph = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = normalizeWhitespace(child.textContent || '');
        headingParagraph.appendChild(strong);
        fragment.appendChild(headingParagraph);
        continue;
      }

      flushText();
      fragment.appendChild(child.cloneNode(true));
    }

    flushText();
    fxBlock.replaceWith(fragment);
  }
}

function describeOmittedMedia(source: string): string {
  if (!source) {
    return 'Recurso multimedia omitido.';
  }

  if (source.startsWith('data:')) {
    return 'Recurso multimedia embebido omitido.';
  }

  return `Recurso multimedia omitido: ${source}`;
}

function sanitizeEmbeddedDataText(value: string): string {
  return value
    .replace(/data:(?:audio|video)\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{120,}/gi, '[Recurso multimedia embebido omitido]')
    .replace(/data:application\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]{120,}/gi, '[Adjunto embebido omitido]');
}

function shouldRemovePrintExtraElement(element: HTMLElement): boolean {
  const className = element.getAttribute('class') || '';
  if (!className) {
    return element.hasAttribute('data-evaluationid') || element.hasAttribute('data-evaluationb');
  }

  const classes = className.split(/\s+/).filter(Boolean);
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'p' && classes.includes('exe-mindmap-code')) {
    return true;
  }

  if (
    classes.includes('game-evaluation-ids') ||
    element.hasAttribute('data-evaluationid') ||
    element.hasAttribute('data-evaluationb')
  ) {
    return true;
  }

  if (!classes.includes('js-hidden')) {
    return false;
  }

  if (classes.includes('form-Data') || classes.some(classToken => /datagame/i.test(classToken))) {
    return true;
  }

  if (tagName === 'div' && classes.some(classToken => /.+-(version|bns)$/i.test(classToken))) {
    return true;
  }

  if ((tagName === 'a' || tagName === 'img') && classes.some(classToken => /image|audio|video/i.test(classToken))) {
    return true;
  }

  return false;
}

function normalizeHeadingLevels(fragment: DocumentFragment, pageDepth: number): void {
  const headings = Array.from(fragment.querySelectorAll('h1, h2, h3, h4, h5, h6'));

  for (const heading of headings) {
    const originalLevel = Number.parseInt(heading.tagName.slice(1), 10) || 1;
    const targetLevel = clampHeadingLevel(pageDepth + originalLevel);
    if (targetLevel === originalLevel) {
      continue;
    }

    const replacement = document.createElement(`h${targetLevel}`);
    for (const attribute of Array.from(heading.attributes)) {
      replacement.setAttribute(attribute.name, attribute.value);
    }
    replacement.innerHTML = heading.innerHTML;
    heading.replaceWith(replacement);
  }
}

function rewriteAssetReferences(sourceHtml: string, assets: Map<string, AssetEntry>): string {
  return sourceHtml.replace(
    /\b(src|href|poster)=("([^"]*)"|'([^']*)')/gi,
    (full, attributeName: string, quotedValue: string, doubleQuoted?: string, singleQuoted?: string) => {
      const rawValue = doubleQuoted ?? singleQuoted ?? '';
      const embeddedValue = resolveAssetValue(rawValue, assets);
      if (embeddedValue === rawValue) {
        return full;
      }

      const quote = quotedValue.startsWith('"') ? '"' : "'";
      return `${attributeName}=${quote}${embeddedValue}${quote}`;
    },
  );
}

function resolveAssetValue(rawValue: string, assets: Map<string, AssetEntry>): string {
  if (!rawValue || rawValue.startsWith('data:') || /^(?:https?:)?\/\//i.test(rawValue) || rawValue.startsWith('#')) {
    return rawValue;
  }

  const normalized = normalizeAssetPath(rawValue.replace(/^\{\{context_path\}\}\//, ''));
  const directAsset = assets.get(normalized);
  if (directAsset) {
    return toDataUrl(directAsset);
  }

  if (rawValue.startsWith('asset://')) {
    const assetId = rawValue.slice('asset://'.length);
    const byId = assets.get(normalizeAssetPath(assetId));
    if (byId) {
      return toDataUrl(byId);
    }
  }

  return rawValue;
}

function collectAssets(entries: Record<string, Uint8Array>): Map<string, AssetEntry> {
  const assets = new Map<string, AssetEntry>();

  for (const [zipPath, data] of Object.entries(entries)) {
    const normalized = normalizeAssetPath(zipPath);
    if (!isAssetPath(normalized)) {
      continue;
    }

    const asset: AssetEntry = {
      zipPath: normalized,
      data,
      mime: getMimeType(normalized),
    };

    assets.set(normalized, asset);
    assets.set(normalizeAssetPath(stripContentPrefix(normalized)), asset);

    const filename = normalized.split('/').pop();
    if (filename) {
      assets.set(filename, asset);
      assets.set(`resources/${filename}`, asset);
    }
  }

  return assets;
}

function isAssetPath(zipPath: string): boolean {
  if (!zipPath || zipPath.endsWith('/')) {
    return false;
  }

  const parts = zipPath.split('/');
  if (parts[0] === 'content' && parts.length > 2 && ASSET_DIRECTORIES.includes(parts[1].toLowerCase())) {
    return true;
  }

  if (parts.length > 1 && ASSET_DIRECTORIES.includes(parts[0].toLowerCase())) {
    return true;
  }

  if (parts.length === 1) {
    if (SYSTEM_FILES.has(parts[0].toLowerCase())) {
      return false;
    }

    return /\.(jpg|jpeg|png|gif|svg|webp|ico|bmp|mp3|wav|ogg|mp4|webm|ogv|pdf|doc|docx|xls|xlsx|ppt|pptx|zip)$/i.test(
      parts[0],
    );
  }

  return false;
}

function sortPagesHierarchically(pages: ParsedPage[]): ParsedPage[] {
  const childrenByParent = new Map<string | null, ParsedPage[]>();

  for (const page of pages) {
    const bucketKey = page.parentId;
    const bucket = childrenByParent.get(bucketKey) || [];
    bucket.push(page);
    childrenByParent.set(bucketKey, bucket);
  }

  for (const bucket of childrenByParent.values()) {
    bucket.sort((left, right) => left.order - right.order);
  }

  const ordered: ParsedPage[] = [];
  const visited = new Set<string>();

  const appendBranch = (parentId: string | null, depth: number) => {
    const children = childrenByParent.get(parentId) || [];
    for (const child of children) {
      if (visited.has(child.id)) {
        continue;
      }

      visited.add(child.id);
      child.depth = depth;
      ordered.push(child);
      appendBranch(child.id, depth + 1);
    }
  };

  appendBranch(null, 1);

  for (const page of pages) {
    if (!visited.has(page.id)) {
      visited.add(page.id);
      page.depth = 1;
      ordered.push(page);
    }
  }

  return ordered;
}

function clampHeadingLevel(level: number): number {
  return Math.max(1, Math.min(6, level));
}

function toDocxHeadingLevel(level: number) {
  switch (clampHeadingLevel(level)) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    case 5:
      return HeadingLevel.HEADING_5;
    default:
      return HeadingLevel.HEADING_6;
  }
}

function findPropertyValue(xmlDoc: globalThis.Document, key: string): string | null {
  const nodes = Array.from(xmlDoc.getElementsByTagName('odeProperty'));

  for (const node of nodes) {
    const propertyKey = getDirectText(node, 'key');
    if (propertyKey === key) {
      return getDirectText(node, 'value');
    }
  }

  return null;
}

function getDirectChildren(parent: Element, tagName: string): Element[] {
  return Array.from(parent.childNodes).filter(
    child => child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName === tagName,
  ) as Element[];
}

function getDirectText(parent: Element, tagName: string): string | null {
  const child = getDirectChildren(parent, tagName)[0];
  return child?.textContent?.trim() || null;
}

function getOrder(node: Element, tagName: string): number {
  return Number.parseInt(getDirectText(node, tagName) || '0', 10) || 0;
}

function normalizeNullable(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value;
}

function normalizeAssetPath(value: string): string {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(\.\/)+/, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^\//, '')
    .replace(/[?#].*$/, '');
}

function stripContentPrefix(value: string): string {
  return value.replace(/^content\//, '');
}

function toDataUrl(asset: AssetEntry): string {
  return `data:${asset.mime};base64,${encodeBase64(asset.data)}`;
}

function encodeBase64(input: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < input.length; index += chunkSize) {
    const chunk = input.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function decodeUtf8(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function preserveBasicWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeInlineWhitespace(value: string): string {
  if (!value) {
    return '';
  }

  const hasLeadingSpace = /^\s/.test(value);
  const hasTrailingSpace = /\s$/.test(value);
  const collapsed = value.replace(/\s+/g, ' ').trim();

  if (!collapsed) {
    return hasLeadingSpace || hasTrailingSpace ? ' ' : '';
  }

  return `${hasLeadingSpace ? ' ' : ''}${collapsed}${hasTrailingSpace ? ' ' : ''}`;
}


function toOutputFilename(inputName: string): string {
  const safe = inputName.replace(/\.[^.]+$/, '') || 'documento';
  return `${safe}.docx`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', '&quot;');
}

function getMimeType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'css':
      return 'text/css';
    case 'gif':
      return 'image/gif';
    case 'ico':
      return 'image/x-icon';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'mp3':
      return 'audio/mpeg';
    case 'mp4':
      return 'video/mp4';
    case 'ogg':
      return 'audio/ogg';
    case 'ogv':
      return 'video/ogg';
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'svg':
      return 'image/svg+xml';
    case 'wav':
      return 'audio/wav';
    case 'webm':
      return 'video/webm';
    case 'webp':
      return 'image/webp';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    default:
      return 'application/octet-stream';
  }
}
