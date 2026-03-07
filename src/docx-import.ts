import { unzipSync, zipSync } from 'fflate';
import mammoth from 'mammoth';
// @ts-expect-error omml2mathml does not ship TypeScript declarations.
import omml2mathml from 'omml2mathml';
import { MathMLToLaTeX } from 'mathml-to-latex';
import temml from 'temml';

export interface DocxImportProgress {
  phase: 'read' | 'parse' | 'template' | 'pack';
  message: string;
  messageKey?: string;
}

export interface ImportToElpxResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  blockCount: number;
  previewHtml: string;
  previewPages: Record<string, string>;
}

export type HeadingMode = 'block' | 'page';
export type Heading1Mode = 'page' | 'resource';

export interface DocxImportOptions {
  heading1Mode: Heading1Mode;
  heading2Mode: HeadingMode;
  heading3Mode: HeadingMode;
  heading4Mode: HeadingMode;
}

export interface ImportedProject {
  title: string;
  subtitle: string;
  pages: ImportedPage[];
}

export interface ImportedPage {
  title: string;
  level: 1 | 2 | 3 | 4;
  parentIndex: number | null;
  blocks: ImportedBlock[];
}

export interface ImportedBlock {
  title: string;
  html: string;
}

interface TemplateParts {
  entries: Record<string, Uint8Array>;
}

interface PreviewOptions {
  renderLatex?: boolean;
}

interface PreviewPageInfo {
  title: string;
  href: string;
  pageNumber: number;
  level: 1 | 2 | 3 | 4;
  parentIndex: number | null;
}

const EXECONVERT_SIGNATURE = 'eXeConvert v0.1.0-beta.6';

export async function convertDocxToElpx(
  file: File,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .docx...', messageKey: 'progress.readDocx' });
  const inputBuffer = await file.arrayBuffer();

  onProgress?.({ phase: 'parse', message: 'Analizando estilos y contenido del DOCX...', messageKey: 'progress.parseDocxStyles' });
  const htmlValue = await extractDocxHtml(inputBuffer);
  return convertHtmlToElpx(
    htmlValue,
    file.name,
    options,
    onProgress,
    'progress.parseDocumentStructure',
    { renderLatex: true },
  );
}

export async function convertHtmlToElpx(
  htmlValue: string,
  filename: string,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
  parseMessageKey = 'progress.parseDocumentStructure',
  previewOptions: PreviewOptions = {},
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'parse', message: 'Interpretando la estructura del documento...', messageKey: parseMessageKey });
  const project = buildProjectFromHtml(htmlValue, filename, options);

  return convertProjectToElpx(project, filename, undefined, onProgress, previewOptions);
}

export async function convertProjectToElpx(
  project: ImportedProject,
  filename: string,
  extraEntries?: Record<string, Uint8Array>,
  onProgress?: (progress: DocxImportProgress) => void,
  previewOptions: PreviewOptions = {},
): Promise<ImportToElpxResult> {

  onProgress?.({ phase: 'template', message: 'Aplicando la plantilla base de eXeLearning...', messageKey: 'progress.applyTemplate' });
  const template = await loadBaseTemplate();
  if (extraEntries) {
    for (const [entryPath, entryData] of Object.entries(extraEntries)) {
      template.entries[entryPath] = entryData;
    }
  }
  const previewPages = buildStandalonePreviewPages(project, template.entries, previewOptions);
  const previewHtml =
    previewPages['index.html']
      ? previewPages['index.html']
      : '<!doctype html><html lang="es"><body><p>Sin contenido para previsualizar.</p></body></html>';
  const elpxData = buildElpxFromTemplate(template, project);

  onProgress?.({ phase: 'pack', message: 'Generando el archivo .elpx...', messageKey: 'progress.packElpx' });
  const blobData = new Uint8Array(elpxData);
  const blob = new Blob([blobData], { type: 'application/zip' });

  return {
    blob,
    filename: toElpxFilename(filename),
    pageCount: project.pages.length,
    blockCount: project.pages.reduce((count, page) => count + page.blocks.length, 0),
    previewHtml,
    previewPages,
  };
}

async function extractDocxHtml(inputBuffer: ArrayBuffer): Promise<string> {
  const { arrayBuffer: patchedBuffer, formulas } = preprocessDocxMath(inputBuffer);
  const result = await mammoth.convertToHtml(
    { arrayBuffer: patchedBuffer },
    {
      includeEmbeddedStyleMap: true,
      includeDefaultStyleMap: true,
      ignoreEmptyParagraphs: true,
      styleMap: DOCX_STYLE_MAP,
      convertImage: mammoth.images.imgElement(async image => ({
        src: `data:${image.contentType};base64,${await image.readAsBase64String()}`,
      })),
    },
  );
  let htmlValue = result.value;
  const formulaEntries = Array.from(formulas.entries()).sort((a, b) => b[0].length - a[0].length);
  for (const [placeholder, latex] of formulaEntries) {
    htmlValue = htmlValue.replaceAll(placeholder, escapeHtml(latex));
  }
  return htmlValue;
}

function buildProjectFromHtml(htmlValue: string, filename: string, options: DocxImportOptions): ImportedProject {
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${htmlValue}</body></html>`, 'text/html');
  const body = document.body;

  let resourceTitle = '';
  let resourceTitleAssigned = false;
  const pages: ImportedPage[] = [];
  let currentPage: ImportedPage | null = null;
  let currentBlock: ImportedBlock | null = null;
  let currentTopLevelPage: ImportedPage | null = null;
  let currentSecondLevelPage: ImportedPage | null = null;
  let currentThirdLevelPage: ImportedPage | null = null;

  for (const node of Array.from(body.childNodes)) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const tag = node.tagName.toLowerCase();
    const cleanedHtml = normalizeMathMarkup(sanitizeImportedHtml(node.outerHTML));
    const trimmed = normalizeWhitespace(node.textContent || '');

    if (!trimmed && !hasMeaningfulHtml(cleanedHtml)) {
      continue;
    }

    const headingMatch = /^h([1-6])$/.exec(tag);
    if (headingMatch) {
      const rawLevel = Number(headingMatch[1]);
      const useResourceTitle = options.heading1Mode === 'resource';

      if (useResourceTitle && rawLevel === 1 && !resourceTitleAssigned) {
        resourceTitle = trimmed;
        resourceTitleAssigned = true;
        continue;
      }

      const effectiveLevel = useResourceTitle && rawLevel > 1 ? rawLevel - 1 : rawLevel;
      if (effectiveLevel < 1 || effectiveLevel > 4) {
        currentPage = ensurePage(pages, currentPage);
        currentBlock = ensureBlock(currentPage, currentBlock);
        currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
        continue;
      }

      if (effectiveLevel === 1) {
        currentPage = createPage(pages, trimmed, 1, null);
        currentTopLevelPage = currentPage;
        currentSecondLevelPage = null;
        currentThirdLevelPage = null;
        currentBlock = null;
        continue;
      }

      if (effectiveLevel === 2) {
        if (options.heading2Mode === 'page') {
          const parentPage = currentTopLevelPage ?? ensurePage(pages, currentPage);
          currentPage = createPage(pages, trimmed, 2, pages.indexOf(parentPage));
          currentSecondLevelPage = currentPage;
          currentThirdLevelPage = null;
          currentBlock = null;
          continue;
        }

        currentPage = ensurePage(pages, currentPage);
        currentBlock = { title: trimmed, html: '' };
        currentPage.blocks.push(currentBlock);
        continue;
      }

      if (effectiveLevel === 3) {
        if (options.heading2Mode !== 'page') {
          currentPage = ensurePage(pages, currentPage);
          currentBlock = ensureBlock(currentPage, currentBlock);
          currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
          continue;
        }

        if (options.heading3Mode === 'page') {
          const parentPage = currentSecondLevelPage ?? currentTopLevelPage ?? ensurePage(pages, currentPage);
          currentPage = createPage(pages, trimmed, 3, pages.indexOf(parentPage));
          currentThirdLevelPage = currentPage;
          currentBlock = null;
          continue;
        }

        currentPage = ensurePage(pages, currentPage);
        currentBlock = { title: trimmed, html: '' };
        currentPage.blocks.push(currentBlock);
        continue;
      }

      if (options.heading2Mode !== 'page' || options.heading3Mode !== 'page') {
        currentPage = ensurePage(pages, currentPage);
        currentBlock = ensureBlock(currentPage, currentBlock);
        currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
        continue;
      }

      if (options.heading4Mode === 'page') {
        const parentPage = currentThirdLevelPage ?? currentSecondLevelPage ?? currentTopLevelPage ?? ensurePage(pages, currentPage);
        currentPage = createPage(pages, trimmed, 4, pages.indexOf(parentPage));
        currentBlock = null;
        continue;
      }

      currentPage = ensurePage(pages, currentPage);
      currentBlock = { title: trimmed, html: '' };
      currentPage.blocks.push(currentBlock);
      continue;
    }

    currentPage = ensurePage(pages, currentPage);
    currentBlock = ensureBlock(currentPage, currentBlock);
    currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
  }

  if (pages.length === 0) {
    pages.push({
      title: stemFromFilename(filename) || 'Página 1',
      level: 1,
      parentIndex: null,
      blocks: [{ title: 'Contenido', html: '<p>Documento importado sin encabezados detectados.</p>' }],
    });
  }

  for (const page of pages) {
    if (page.blocks.length === 0) {
      page.blocks.push({ title: 'Contenido', html: '<p></p>' });
      continue;
    }

    for (const block of page.blocks) {
      if (!block.html) {
        block.html = '<p></p>';
      }
    }
  }

  return {
    title: resourceTitle || stemFromFilename(filename) || 'Documento importado',
    subtitle: '',
    pages,
  };
}

function preprocessDocxMath(inputBuffer: ArrayBuffer): { arrayBuffer: ArrayBuffer; formulas: Map<string, string> } {
  const entries = unzipSync(new Uint8Array(inputBuffer));
  const documentXml = decodeUtf8(entries['word/document.xml']);
  if (!documentXml) {
    return { arrayBuffer: inputBuffer, formulas: new Map() };
  }

  const document = parseXml(documentXml, 'No se ha podido interpretar word/document.xml.');
  const formulas = new Map<string, string>();
  let formulaIndex = 1;

  const blockMathNodes = Array.from(document.getElementsByTagNameNS(M_NS, 'oMathPara'));
  for (const mathNode of blockMathNodes) {
    const placeholder = createMathPlaceholder(formulaIndex++);
    const latex = convertOmmlElementToLatex(mathNode);
    formulas.set(placeholder, `\\[${latex}\\]`);
    replaceMathNodeWithPlaceholder(document, mathNode, placeholder);
  }

  const inlineMathNodes = Array.from(document.getElementsByTagNameNS(M_NS, 'oMath'));
  for (const mathNode of inlineMathNodes) {
    if (mathNode.parentElement?.namespaceURI === M_NS && mathNode.parentElement.localName === 'oMathPara') {
      continue;
    }

    const placeholder = createMathPlaceholder(formulaIndex++);
    const latex = convertOmmlElementToLatex(mathNode);
    formulas.set(placeholder, `\\(${latex}\\)`);
    replaceMathNodeWithPlaceholder(document, mathNode, placeholder);
  }

  const serialized = new XMLSerializer().serializeToString(document);
  entries['word/document.xml'] = new TextEncoder().encode(serialized);
  const patched = zipSync(entries, { level: 0 });
  const patchedBytes = new Uint8Array(patched);
  const patchedBuffer = patchedBytes.buffer.slice(
    patchedBytes.byteOffset,
    patchedBytes.byteOffset + patchedBytes.byteLength,
  ) as ArrayBuffer;

  return { arrayBuffer: patchedBuffer, formulas };
}

function convertOmmlElementToLatex(element: Element): string {
  try {
    const mathElement = omml2mathml(element) as Element;
    const mathMl = new XMLSerializer().serializeToString(mathElement);
    const latex = normalizeLatexValue(MathMLToLaTeX.convert(mathMl));
    return latex || '?';
  } catch {
    return '?';
  }
}

function replaceMathNodeWithPlaceholder(document: XMLDocument, mathNode: Element, placeholder: string): void {
  const run = document.createElementNS(W_NS, 'w:r');
  const text = document.createElementNS(W_NS, 'w:t');
  text.textContent = placeholder;
  run.appendChild(text);
  mathNode.replaceWith(run);
}

function createMathPlaceholder(index: number): string {
  return `__EXE_MATH_PLACEHOLDER_${index}__`;
}

function ensurePage(pages: ImportedPage[], currentPage: ImportedPage | null): ImportedPage {
  if (currentPage) {
    return currentPage;
  }

  return createPage(pages, `Página ${pages.length + 1}`, 1, null);
}

function createPage(
  pages: ImportedPage[],
  title: string,
  level: 1 | 2 | 3 | 4,
  parentIndex: number | null,
): ImportedPage {
  const page: ImportedPage = { title, level, parentIndex, blocks: [] };
  pages.push(page);
  return page;
}

function ensureBlock(page: ImportedPage, currentBlock: ImportedBlock | null): ImportedBlock {
  if (currentBlock) {
    return currentBlock;
  }

  const block: ImportedBlock = { title: 'Contenido', html: '' };
  page.blocks.push(block);
  return block;
}

function appendParagraphHtml(existing: string, paragraphHtml: string): string {
  return existing ? `${existing}\n${paragraphHtml}` : paragraphHtml;
}

function sanitizeImportedHtml(html: string): string {
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
  return Array.from(document.body.childNodes)
    .map(node => normalizeImportedNode(node))
    .join('')
    .trim();
}

function normalizeImportedNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent || '');
  }

  if (!(node instanceof HTMLElement)) {
    return '';
  }

  const tag = node.tagName.toLowerCase();
  const normalizedChildren = Array.from(node.childNodes)
    .map(child => normalizeImportedNode(child))
    .join('');

  switch (tag) {
    case 'div':
    case 'span':
      return normalizedChildren;
    case 'b':
      return wrapTag('strong', normalizedChildren);
    case 'i':
      return wrapTag('em', normalizedChildren);
    case 'strike':
      return wrapTag('del', normalizedChildren);
    case 'p':
    case 'ul':
    case 'ol':
    case 'li':
    case 'table':
    case 'thead':
    case 'tbody':
    case 'tr':
    case 'th':
    case 'td':
    case 'strong':
    case 'em':
    case 'u':
    case 'sup':
    case 'sub':
    case 'blockquote':
    case 'pre':
    case 'code':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return wrapTag(tag, normalizedChildren);
    case 'br':
      return '<br />';
    case 'a': {
      const href = (node.getAttribute('href') || '').trim();
      if (!href) {
        return normalizedChildren;
      }
      return `<a href="${escapeHtml(href)}">${normalizedChildren}</a>`;
    }
    case 'img': {
      const src = (node.getAttribute('src') || '').trim();
      if (!src) {
        return '';
      }
      const alt = (node.getAttribute('alt') || '').trim();
      const altAttribute = alt ? ` alt="${escapeHtml(alt)}"` : '';
      return `<img src="${escapeHtml(src)}"${altAttribute} />`;
    }
    default:
      return normalizedChildren;
  }
}

function wrapTag(tag: string, innerHtml: string): string {
  if (!innerHtml && tag !== 'p' && tag !== 'td' && tag !== 'th') {
    return '';
  }

  return `<${tag}>${innerHtml}</${tag}>`;
}

function hasMeaningfulHtml(html: string): boolean {
  if (!html) {
    return false;
  }

  const text = normalizeWhitespace(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<img\b[^>]*>/gi, ' [img] ')
      .replace(/<table\b[\s\S]*?<\/table>/gi, ' [table] ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' '),
  );

  return text.length > 0;
}

async function loadBaseTemplate(): Promise<TemplateParts> {
  const response = await fetch(`${import.meta.env.BASE_URL}base.elpx`);
  if (!response.ok) {
    throw new Error('No se ha podido cargar la plantilla base integrada.');
  }

  const entries = unzipSync(new Uint8Array(await response.arrayBuffer()));
  if (!entries['content.xml']) {
    throw new Error('La plantilla base no contiene content.xml.');
  }

  await Promise.all(
    TEXT_IDEVICE_ASSETS.map(async assetPath => {
      const assetResponse = await fetch(`${import.meta.env.BASE_URL}${assetPath}`);
      if (!assetResponse.ok) {
        throw new Error(`No se ha podido cargar el recurso ${assetPath}.`);
      }
      entries[assetPath] = new Uint8Array(await assetResponse.arrayBuffer());
    }),
  );

  const mathAssetsResponse = await fetch(`${import.meta.env.BASE_URL}${EXE_MATH_ASSET_ARCHIVE}`);
  if (!mathAssetsResponse.ok) {
    throw new Error('No se ha podido cargar el paquete de MathJax integrado.');
  }

  const mathEntries = unzipSync(new Uint8Array(await mathAssetsResponse.arrayBuffer()));
  for (const [assetPath, data] of Object.entries(mathEntries)) {
    if (!assetPath.startsWith('exe_math/')) {
      continue;
    }
    entries[`libs/${assetPath}`] = data;
  }

  return { entries };
}

function buildElpxFromTemplate(template: TemplateParts, project: ImportedProject): Uint8Array {
  const { entries } = template;
  entries['content.xml'] = new TextEncoder().encode(generateContentXml(project));
  addPreviewHtmlEntries(entries, project);
  return zipSync(entries, { level: 0 });
}

function buildStandalonePreviewPages(
  project: ImportedProject,
  entries: Record<string, Uint8Array>,
  previewOptions: PreviewOptions = {},
): Record<string, string> {
  const pages = getPreviewPages(project);
  const output: Record<string, string> = {};

  for (const [index, pageInfo] of pages.entries()) {
    const html = generatePreviewPageHtml(project, pages, index, previewOptions);
    output[pageInfo.href] = buildStandalonePreviewHtml(html, entries, pageInfo.href);
  }

  return output;
}

function buildStandalonePreviewHtml(html: string, entries: Record<string, Uint8Array>, docPath: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const docAny = document as Document & { querySelectorAll?: Document['querySelectorAll']; head?: HTMLElement | null; body?: HTMLElement | null };

  if (!docAny.querySelectorAll || !docAny.body) {
    return html;
  }

  for (const link of Array.from(document.querySelectorAll<HTMLLinkElement>('link[href]'))) {
    const href = (link.getAttribute('href') || '').trim();
    const resolved = resolveEntryPath(docPath, href, entries);
    if (!resolved) {
      link.remove();
      continue;
    }

    if (/\.css$/i.test(resolved)) {
      const style = document.createElement('style');
      style.textContent = inlineCssAssetUrls(decodeUtf8(entries[resolved]), resolved, entries);
      link.replaceWith(style);
      continue;
    }

    link.remove();
  }

  for (const script of Array.from(document.querySelectorAll('script'))) {
    script.remove();
  }

  const mediaNodes = Array.from(document.querySelectorAll<HTMLElement>('[src], [poster], source[src], track[src]'));
  for (const node of mediaNodes) {
    for (const attribute of ['src', 'poster']) {
      const rawValue = (node.getAttribute(attribute) || '').trim();
      if (!rawValue) {
        continue;
      }
      const resolved = resolveEntryPath(docPath, rawValue, entries);
      if (!resolved) {
        continue;
      }

      const mime = getMimeTypeFromPath(resolved);
      const dataUrl = `data:${mime};base64,${uint8ToBase64(entries[resolved])}`;
      node.setAttribute(attribute, dataUrl);
    }
  }

  for (const frameLike of Array.from(document.querySelectorAll('iframe, object, embed'))) {
    const replacement = document.createElement('div');
    replacement.className = 'preview-embed-placeholder';
    replacement.textContent = 'Contenido incrustado omitido en la vista previa.';
    frameLike.replaceWith(replacement);
  }

  const previewStyle = document.createElement('style');
  previewStyle.textContent = `
.preview-embed-placeholder {
  margin: 0.75rem 0;
  padding: 0.75rem;
  border: 1px dashed #9db29a;
  border-radius: 6px;
  background: #f4f8f2;
  color: #3e5740;
  font-style: italic;
}
`;
  docAny.head?.append(previewStyle);

  return `<!doctype html>\n${document.documentElement.outerHTML}`;
}

function resolveEntryPath(docPath: string, reference: string, entries: Record<string, Uint8Array>): string | null {
  const raw = reference.trim();
  if (!raw || raw.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) {
    return null;
  }

  const normalizedReference = raw.split('#')[0].split('?')[0];
  if (!normalizedReference) {
    return null;
  }

  const baseDir = docPath.includes('/') ? docPath.slice(0, docPath.lastIndexOf('/') + 1) : '';
  const combined = normalizedReference.startsWith('/') ? normalizedReference.slice(1) : `${baseDir}${normalizedReference}`;
  const normalized = normalizeEntryPath(combined);
  const candidates = [
    normalized,
    normalized.startsWith('html/') ? normalized.slice(5) : '',
    normalized.startsWith('content/') ? normalized.slice(8) : '',
    `content/${normalized}`,
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (entries[candidate]) {
      return candidate;
    }
  }
  return null;
}

function normalizeEntryPath(path: string): string {
  const parts = path.replaceAll('\\', '/').split('/');
  const normalized: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') {
      continue;
    }
    if (part === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(part);
  }
  return normalized.join('/');
}

function uint8ToBase64(data: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < data.length; index += chunkSize) {
    const chunk = data.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function getMimeTypeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith('.css')) return 'text/css';
  if (lower.endsWith('.js')) return 'application/javascript';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.woff2')) return 'font/woff2';
  if (lower.endsWith('.woff')) return 'font/woff';
  if (lower.endsWith('.ttf')) return 'font/ttf';
  if (lower.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

function inlineCssAssetUrls(cssText: string, cssPath: string, entries: Record<string, Uint8Array>): string {
  return cssText.replace(/url\(([^)]+)\)/gi, (fullMatch, rawReference: string) => {
    const reference = rawReference.trim().replace(/^['"]|['"]$/g, '');
    if (!reference || reference.startsWith('data:') || reference.startsWith('#')) {
      return fullMatch;
    }

    const resolved = resolveEntryPath(cssPath, reference, entries);
    if (!resolved) {
      return fullMatch;
    }

    const mime = getMimeTypeFromPath(resolved);
    const dataUrl = `data:${mime};base64,${uint8ToBase64(entries[resolved])}`;
    return `url("${dataUrl}")`;
  });
}

function generateContentXml(project: ImportedProject): string {
  const odeId = createResourceId();
  const odeVersionId = createResourceId();
  const modified = String(Date.now());
  const generatedAtIso = new Date().toISOString();
  const pageIds = project.pages.map(() => createPageId());
  const navStructuresXml = project.pages
    .map((page, index) => generateOdeNavStructureXml(page, index, pageIds))
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ode SYSTEM "content.dtd">
<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">
<userPreferences>
  <userPreference>
    <key>theme</key>
    <value>base</value>
  </userPreference>
</userPreferences>
<odeResources>
  <odeResource><key>odeId</key><value>${escapeXml(odeId)}</value></odeResource>
  <odeResource><key>odeVersionId</key><value>${escapeXml(odeVersionId)}</value></odeResource>
  <odeResource><key>exe_version</key><value>3.0</value></odeResource>
</odeResources>
<odeProperties>
  <odeProperty><key>pp_title</key><value>${escapeXml(project.title || 'Documento importado')}</value></odeProperty>
  <odeProperty><key>pp_subtitle</key><value>${escapeXml(project.subtitle || '')}</value></odeProperty>
  <odeProperty><key>pp_lang</key><value>es</value></odeProperty>
  <odeProperty><key>pp_license</key><value>creative commons: attribution - share alike 4.0</value></odeProperty>
  <odeProperty><key>pp_licenseUrl</key><value>https://creativecommons.org/licenses/by-sa/4.0/</value></odeProperty>
  <odeProperty><key>pp_theme</key><value>base</value></odeProperty>
  <odeProperty><key>pp_exelearning_version</key><value>v4.0.0-beta1</value></odeProperty>
  <odeProperty><key>pp_modified</key><value>${escapeXml(modified)}</value></odeProperty>
  <odeProperty><key>pp_addExeLink</key><value>false</value></odeProperty>
  <odeProperty><key>pp_addPagination</key><value>true</value></odeProperty>
  <odeProperty><key>pp_addSearchBox</key><value>false</value></odeProperty>
  <odeProperty><key>pp_addAccessibilityToolbar</key><value>false</value></odeProperty>
  <odeProperty><key>pp_addMathJax</key><value>true</value></odeProperty>
  <odeProperty><key>exportSource</key><value>true</value></odeProperty>
  <odeProperty><key>pp_globalFont</key><value>default</value></odeProperty>
  <odeProperty><key>execonvert_generator</key><value>${escapeXml(EXECONVERT_SIGNATURE)}</value></odeProperty>
  <odeProperty><key>execonvert_generatedAt</key><value>${escapeXml(generatedAtIso)}</value></odeProperty>
</odeProperties>
<odeNavStructures>
${navStructuresXml}</odeNavStructures>
</ode>`;
}

function generateOdeNavStructureXml(page: ImportedPage, order: number, pageIds: string[]): string {
  const pageId = pageIds[order];
  const parentPageId = page.parentIndex === null ? '' : pageIds[page.parentIndex] || '';
  const title = page.title || `Página ${order + 1}`;
  const blocksXml = page.blocks.map((block, index) => generateOdePagStructureXml(block, pageId, index)).join('');

  return `<odeNavStructure>
  <odePageId>${escapeXml(pageId)}</odePageId>
  <odeParentPageId>${escapeXml(parentPageId)}</odeParentPageId>
  <pageName>${escapeXml(title)}</pageName>
  <odeNavStructureOrder>${order}</odeNavStructureOrder>
  <odeNavStructureProperties>
${generateNavStructurePropertyEntry('titlePage', title)}${generateNavStructurePropertyEntry('titleNode', title)}${generateNavStructurePropertyEntry('hidePageTitle', 'false')}${generateNavStructurePropertyEntry('titleHtml', '')}${generateNavStructurePropertyEntry('editableInPage', 'false')}${generateNavStructurePropertyEntry('visibility', 'true')}${generateNavStructurePropertyEntry('highlight', 'false')}${generateNavStructurePropertyEntry('description', '')}  </odeNavStructureProperties>
  <odePagStructures>
${blocksXml}  </odePagStructures>
</odeNavStructure>
`;
}

function generateNavStructurePropertyEntry(key: string, value: string): string {
  return `    <odeNavStructureProperty>
      <key>${escapeXml(key)}</key>
      <value>${escapeXml(value)}</value>
    </odeNavStructureProperty>
`;
}

function generateOdePagStructureXml(block: ImportedBlock, pageId: string, order: number): string {
  const blockId = createBlockId();
  const ideviceId = createIdeviceId();
  const blockName = block.title || 'Contenido';
  const html = block.html || '<p></p>';
  const wrappedHtml = `<div class="exe-text-template">\n${html}\n</div>`;
  const jsonProperties = JSON.stringify({
    ideviceId,
    textInfoDurationInput: '',
    textInfoDurationTextInput: 'Duración',
    textInfoParticipantsInput: '',
    textInfoParticipantsTextInput: 'Agrupamiento',
    textTextarea: html,
    textFeedbackInput: 'Mostrar retroalimentación',
    textFeedbackTextarea: '',
  });

  return `    <odePagStructure>
      <odePageId>${escapeXml(pageId)}</odePageId>
      <odeBlockId>${escapeXml(blockId)}</odeBlockId>
      <blockName>${escapeXml(blockName)}</blockName>
      <iconName></iconName>
      <odePagStructureOrder>${order}</odePagStructureOrder>
      <odePagStructureProperties>
${generatePagStructurePropertyEntry('visibility', 'true')}${generatePagStructurePropertyEntry('teacherOnly', 'false')}${generatePagStructurePropertyEntry('allowToggle', 'true')}${generatePagStructurePropertyEntry('minimized', 'false')}${generatePagStructurePropertyEntry('cssClass', '')}      </odePagStructureProperties>
      <odeComponents>
        <odeComponent>
          <odePageId>${escapeXml(pageId)}</odePageId>
          <odeBlockId>${escapeXml(blockId)}</odeBlockId>
          <odeIdeviceId>${escapeXml(ideviceId)}</odeIdeviceId>
          <odeIdeviceTypeName>text</odeIdeviceTypeName>
          <htmlView><![CDATA[${escapeCdata(wrappedHtml)}]]></htmlView>
          <jsonProperties><![CDATA[${escapeCdata(jsonProperties)}]]></jsonProperties>
          <odeComponentsOrder>0</odeComponentsOrder>
          <odeComponentsProperties>
          </odeComponentsProperties>
        </odeComponent>
      </odeComponents>
    </odePagStructure>
`;
}

function generatePagStructurePropertyEntry(key: string, value: string): string {
  return `        <odePagStructureProperty>
          <key>${escapeXml(key)}</key>
          <value>${escapeXml(value)}</value>
        </odePagStructureProperty>
`;
}

function addPreviewHtmlEntries(entries: Record<string, Uint8Array>, project: ImportedProject): void {
  const pages = getPreviewPages(project);

  for (const existingPath of Object.keys(entries)) {
    if (existingPath.startsWith('html/') && existingPath.endsWith('.html')) {
      delete entries[existingPath];
    }
  }

  for (const [index, page] of pages.entries()) {
    const html = generatePreviewPageHtml(project, pages, index);
    entries[page.href] = new TextEncoder().encode(html);
  }
}

function getPreviewPages(project: ImportedProject): PreviewPageInfo[] {
  const used = new Set<string>();

  return project.pages.map((page, index) => {
    if (index === 0) {
      return {
        title: page.title || 'Página 1',
        href: 'index.html',
        pageNumber: 1,
        level: page.level,
        parentIndex: page.parentIndex,
      };
    }

    let slug = slugifyPageTitle(page.title || `pagina-${index + 1}`);
    if (!slug) {
      slug = `pagina-${index + 1}`;
    }

    let candidate = slug;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${slug}-${suffix}`;
      suffix += 1;
    }
    used.add(candidate);

    return {
      title: page.title || `Página ${index + 1}`,
      href: `html/${candidate}.html`,
      pageNumber: index + 1,
      level: page.level,
      parentIndex: page.parentIndex,
    };
  });
}

function generatePreviewPageHtml(
  project: ImportedProject,
  pages: PreviewPageInfo[],
  activeIndex: number,
  previewOptions: PreviewOptions = {},
): string {
  const activePageInfo = pages[activeIndex];
  const activePage = project.pages[activeIndex];
  const assetPrefix = activeIndex === 0 ? '' : '../';
  const prevPage = activeIndex > 0 ? pages[activeIndex - 1] : null;
  const nextPage = activeIndex < pages.length - 1 ? pages[activeIndex + 1] : null;
  const navItems = generatePreviewNavHtml(pages, activePageInfo.pageNumber, activeIndex);
  const blocks = activePage.blocks
    .map((block, blockIndex) => generatePreviewBlockHtml(block, activePageInfo.pageNumber, blockIndex, previewOptions))
    .join('\n');
  const prevHref = prevPage
    ? activeIndex === 1
      ? '../index.html'
      : activeIndex > 1
        ? prevPage.href.replace(/^html\//, '')
        : prevPage.href
    : '';
  const nextHref = nextPage
    ? activeIndex === 0
      ? nextPage.href
      : nextPage.pageNumber === 1
        ? '../index.html'
        : nextPage.href.replace(/^html\//, '')
    : '';

  return `<!DOCTYPE html>
<html lang="es" id="exe-index">
<head>
<meta charset="utf-8">
<meta name="generator" content="eXeLearning v4.0.0-beta1">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="license" type="text/html" href="https://creativecommons.org/licenses/by-sa/4.0/">
<title>${escapeHtml(project.title || 'eXeLearning')}</title>
<link rel="icon" type="image/x-icon" href="${assetPrefix}libs/favicon.ico">
<script>document.querySelector("html").classList.add("js");</script><script src="${assetPrefix}libs/jquery/jquery.min.js"> </script><script src="${assetPrefix}libs/common_i18n.js"> </script><script src="${assetPrefix}libs/common.js"> </script><script src="${assetPrefix}libs/exe_export.js"> </script><script src="${assetPrefix}libs/bootstrap/bootstrap.bundle.min.js"> </script><link rel="stylesheet" href="${assetPrefix}libs/bootstrap/bootstrap.min.css">
<script>
window.MathJax = {
  tex: {
    inlineMath: [['\\\\(', '\\\\)']],
    displayMath: [['\\\\[', '\\\\]']],
    processEscapes: true,
  },
  svg: {
    fontCache: 'global',
  },
};
</script>
<script src="${assetPrefix}libs/exe_math/tex-mml-svg.js"></script>
<script src="${assetPrefix}idevices/text/text.js"></script><link rel="stylesheet" href="${assetPrefix}idevices/text/text.css">
<link rel="stylesheet" href="${assetPrefix}content/css/base.css"><script src="${assetPrefix}theme/style.js"> </script><link rel="stylesheet" href="${assetPrefix}theme/style.css">
<style>
body.exe-export.exe-web-site{min-width:0}
.idevice_node.text .exe-text-template>:first-child{margin-top:0}
.idevice_node.text .exe-text-template>:last-child{margin-bottom:0}
.page-content .box+.box{margin-top:1.25rem}
</style>
</head>
<body class="exe-export exe-web-site">
<script>document.body.className+=" js"</script>
<div class="exe-content exe-export pre-js siteNav-hidden"> <nav id="siteNav">
<ul>
${navItems}
</ul>
</nav><main id="${escapeHtml(createPageDomId(activePageInfo.pageNumber))}" class="page"> 
<header class="main-header"> <p class="page-counter"> <span class="page-counter-label">Página </span><span class="page-counter-content"> <strong class="page-counter-current-page">${activePageInfo.pageNumber}</strong><span class="page-counter-sep">/</span><strong class="page-counter-total">${pages.length}</strong></span></p>

<div class="package-header"><h1 class="package-title">${escapeHtml(project.title || 'Documento importado')}</h1></div>
<div class="page-header"><h2 class="page-title">${escapeHtml(activePage.title || `Página ${activePageInfo.pageNumber}`)}</h2></div>
</header><div id="page-content-${escapeHtml(createPageDomId(activePageInfo.pageNumber))}" class="page-content">
${blocks}
</div></main><div class="nav-buttons">
${prevPage ? `<a href="${escapeHtml(prevHref)}" title="Previous" class="nav-button nav-button-left"><span>Previous</span></a>` : '<span class="nav-button nav-button-left" aria-hidden="true"><span>Previous</span></span>'}
${nextPage ? `<a href="${escapeHtml(nextHref)}" title="Next" class="nav-button nav-button-right"><span>Next</span></a>` : '<span class="nav-button nav-button-right" aria-hidden="true"><span>Next</span></span>'}
</div>
<footer id="siteFooter"><div id="siteFooterContent"> <div id="packageLicense" class="cc cc-by-sa"> <p> <span class="license-label">Licencia: </span><a href="https://creativecommons.org/licenses/by-sa/4.0/" class="license">creative commons: attribution - share alike 4.0 (BY-SA)</a></p>
</div>
</div></footer>
</div>

</body>
</html>`;
}

function generatePreviewNavHtml(pages: PreviewPageInfo[], activePageNumber: number, activeIndex: number): string {
  const buildHref = (pageInfo: PreviewPageInfo): string => {
    if (activeIndex === 0) {
      return pageInfo.href;
    }
    return pageInfo.pageNumber === 1 ? `../${pageInfo.href}` : pageInfo.href.replace(/^html\//, '');
  };

  const renderBranch = (parentIndex: number | null): string => {
    const branchPages = pages.filter((page, index) => page.parentIndex === parentIndex && index !== parentIndex);

    return branchPages
      .map((pageInfo, index) => {
        const pageIndex = pages.findIndex(candidate => candidate.pageNumber === pageInfo.pageNumber);
        const active = pageInfo.pageNumber === activePageNumber;
        const classes = [
          active ? 'active' : '',
          pageInfo.pageNumber === 1 ? 'root-node' : '',
          `nav-level-${pageInfo.level}`,
        ]
          .filter(Boolean)
          .join(' ');
        const childrenHtml = renderBranch(pageIndex);
        const childList = childrenHtml ? `\n<ul>\n${childrenHtml}\n</ul>` : '';
        return `<li${active ? ' class="active"' : ''}><a href="${escapeHtml(buildHref(pageInfo))}" class="${escapeHtml(
          `${classes} no-ch`.trim(),
        )}">${escapeHtml(pageInfo.title)}</a>${childList}</li>`;
      })
      .join('\n');
  };

  return renderBranch(null);
}

function generatePreviewBlockHtml(
  block: ImportedBlock,
  pageNumber: number,
  blockIndex: number,
  previewOptions: PreviewOptions = {},
): string {
  const blockId = `block-preview-${pageNumber}-${blockIndex + 1}`;
  const ideviceId = `idevice-preview-${pageNumber}-${blockIndex + 1}`;
  const sanitizedHtml = sanitizePreviewBlockHtml(block.html || '<p></p>');
  const safeHtml = previewOptions.renderLatex ? renderLatexPreviewHtml(sanitizedHtml) : sanitizedHtml;

  return `<article id="${escapeHtml(blockId)}" class="box">
<header class="box-head no-icon">
<h1 class="box-title">${escapeHtml(block.title || 'Contenido')}</h1>
<button class="box-toggle box-toggle-on" title="Toggle content">
<span>Toggle content</span>
</button></header>
<div class="box-content">
<div id="${escapeHtml(ideviceId)}" class="idevice_node text" data-idevice-path="idevices/text/" data-idevice-type="text" data-idevice-component-type="json" data-idevice-json-data="{&quot;ideviceId&quot;:&quot;${escapeHtml(ideviceId)}&quot;}">
<div class="exe-text"><div class="exe-text-template">
${safeHtml}
</div></div>
</div>
</div>
</article>`;
}

function createPageDomId(pageNumber: number): string {
  return `page-preview-${pageNumber}`;
}

function slugifyPageTitle(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizePreviewBlockHtml(html: string): string {
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, 'text/html');
  const body = (document as Document & { body?: HTMLElement | null }).body;
  if (!body || !('querySelectorAll' in body)) {
    return html;
  }
  for (const element of Array.from(body.querySelectorAll('script, iframe, object, embed'))) {
    const replacement = document.createElement('div');
    replacement.className = 'preview-embed-placeholder';
    replacement.textContent = 'Contenido incrustado omitido en la vista previa.';
    element.replaceWith(replacement);
  }

  for (const anchor of Array.from(body.querySelectorAll<HTMLAnchorElement>('a[href]'))) {
    const href = (anchor.getAttribute('href') || '').trim();
    if (!href || href.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
      continue;
    }
    anchor.setAttribute('href', '#');
    anchor.removeAttribute('target');
  }

  return body.innerHTML || '<p></p>';
}

function renderLatexPreviewHtml(html: string): string {
  return html
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression: string) => renderLatexFragment(expression, true))
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expression: string) => renderLatexFragment(expression, false));
}

function renderLatexFragment(expression: string, displayMode: boolean): string {
  const normalized = normalizeLegacyPreviewLatex(expression);
  if (!normalized) {
    return displayMode ? '\\[\\]' : '\\(\\)';
  }

  try {
    return temml.renderToString(normalized, {
      displayMode,
      throwOnError: false,
      annotate: false,
    });
  } catch {
    return displayMode ? `\\[${normalized}\\]` : `\\(${normalized}\\)`;
  }
}

function normalizeLegacyPreviewLatex(expression: string): string {
  const htmlLike = expression
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');

  const parsed = new DOMParser().parseFromString(`<!doctype html><html><body>${htmlLike}</body></html>`, 'text/html');
  const body = (parsed as Document & { body?: HTMLElement | null }).body;
  const text = body?.textContent || htmlLike;

  return text
    .normalize('NFC')
    .replace(/\u00a0/g, ' ')
    .replace(/[\uFFFD\uFEFF\u00AD\u2066-\u2069\u200B-\u200F\u202A-\u202E\uFFF9-\uFFFB]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function decodeUtf8(data?: Uint8Array): string {
  return data ? new TextDecoder().decode(data) : '';
}

function parseXml(xml: string, errorMessage: string): XMLDocument {
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error(errorMessage);
  }
  return document;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeMathMarkup(html: string): string {
  const replaceMath = (fullMatch: string, content: string, open: string, close: string): string => {
    const normalized = normalizeLatexValue(stripHtmlFromMath(content));
    if (!normalized) {
      return fullMatch;
    }
    if (!looksLikeMathExpression(normalized)) {
      return fullMatch;
    }
    return `${open}${normalized}${close}`;
  };

  const withInlineMath = html.replace(/\\\(([\s\S]*?)\\\)/g, (fullMatch, content) =>
    replaceMath(fullMatch, content, '\\(', '\\)'),
  );

  return withInlineMath.replace(/\\\[([\s\S]*?)\\\]/g, (fullMatch, content) =>
    replaceMath(fullMatch, content, '\\[', '\\]'),
  );
}

function stripHtmlFromMath(value: string): string {
  const withLineBreaks = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<\/div>\s*<div>/gi, '\n');
  const document = new DOMParser().parseFromString(
    `<!doctype html><html><body>${withLineBreaks}</body></html>`,
    'text/html',
  );
  return document.body.textContent || '';
}

function normalizeLatexValue(value: string): string {
  let output = value.normalize('NFC').replace(/\u00a0/g, ' ').replace(/\r/g, '');
  output = output.replace(/[\uFFFD\uFEFF\u00AD\u2066-\u2069\u200B-\u200F\u202A-\u202E\uFFF9-\uFFFB]/g, '');
  output = output.replace(/[\uD800-\uDFFF]/g, '');
  output = output.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  output = output.replace(/[ \t]*\n[ \t]*/g, '\n');
  output = output.replace(/\\\s+([A-Za-z])/g, '\\$1');
  output = output.replace(/\\ext\{/g, '\\text{');
  output = output.replace(/\bL\s+A\s+T\s+E\s+X\b\\?/g, '\\LaTeX');
  output = output.replace(/(^|[^\\])\.{2}\s+\\\\/g, '$1\\ldots ');
  output = output.replace(/\\\\backslash\b/g, '\\\\');
  output = output.replace(/\\backslash\b/g, '\\\\');
  output = output.replace(/[ \t]+/g, ' ');
  output = output.replace(/ ?\n ?/g, '\n');
  output = output.trim();

  while (output.endsWith('\\')) {
    output = output.slice(0, -1).trimEnd();
  }

  return output;
}

function looksLikeMathExpression(value: string): boolean {
  if (!value || value.length > 8000) {
    return false;
  }

  if (/^(?:[A-Za-z]\s+){1,}[A-Za-z]$/.test(value)) {
    return true;
  }

  if (/[0-9_^=+\-*/<>|&{}]/.test(value)) {
    return true;
  }

  if (/\\[A-Za-z]+/.test(value)) {
    return true;
  }

  if (/^[A-Za-z]$/.test(value)) {
    return true;
  }

  return false;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

function escapeCdata(value: string): string {
  return value.replaceAll(']]>', ']]]]><![CDATA[>');
}

function stemFromFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').trim();
}

function toElpxFilename(inputFilename: string): string {
  const stem = stemFromFilename(inputFilename) || 'proyecto';
  return `${stem}.elpx`;
}

function createPageId(): string {
  return crypto.randomUUID();
}

function createBlockId(): string {
  return `block-${Date.now()}-${randomSuffix()}`;
}

function createIdeviceId(): string {
  return `idevice-${Date.now()}-${randomSuffix()}`;
}

function createResourceId(): string {
  return `${timestampStamp()}${randomUppercase(6)}`;
}

function timestampStamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
}

function randomSuffix(length = 9): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let output = '';
  for (let index = 0; index < length; index += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

function randomUppercase(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for (let index = 0; index < length; index += 1) {
    output += chars[Math.floor(Math.random() * chars.length)];
  }
  return output;
}

const TEXT_IDEVICE_ASSETS = ['idevices/text/text.js', 'idevices/text/text.css', 'idevices/text/text.html'] as const;
const EXE_MATH_ASSET_ARCHIVE = 'exe_math_assets.zip';
const DOCX_STYLE_MAP: string[] = [
  "p[style-name='Code'] => pre:fresh",
  "p[style-name='Código'] => pre:fresh",
  "p[style-name='Codigo'] => pre:fresh",
  "p[style-name='HTML'] => pre:fresh",
  "p[style-name='Preformatted'] => pre:fresh",
  "p[style-name='Preformatted Text'] => pre:fresh",
  "r[style-name='Code'] => code",
  "r[style-name='Código'] => code",
  "r[style-name='Codigo'] => code",
  "r[style-name='HTML'] => code",
];
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const M_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
