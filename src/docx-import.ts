import { unzipSync, zipSync } from 'fflate';
import mammoth from 'mammoth';
// @ts-expect-error omml2mathml does not ship TypeScript declarations.
import omml2mathml from 'omml2mathml';
import { MathMLToLaTeX } from 'mathml-to-latex';

export interface DocxImportProgress {
  phase: 'read' | 'parse' | 'template' | 'pack';
  message: string;
}

export interface ImportToElpxResult {
  blob: Blob;
  filename: string;
  pageCount: number;
  blockCount: number;
}

export type HeadingMode = 'block' | 'page';

export interface DocxImportOptions {
  heading2Mode: HeadingMode;
  heading3Mode: HeadingMode;
  heading4Mode: HeadingMode;
}

interface ImportedProject {
  title: string;
  subtitle: string;
  pages: ImportedPage[];
}

interface ImportedPage {
  title: string;
  level: 1 | 2 | 3 | 4;
  parentIndex: number | null;
  blocks: ImportedBlock[];
}

interface ImportedBlock {
  title: string;
  html: string;
}

interface TemplateParts {
  entries: Record<string, Uint8Array>;
}

interface PreviewPageInfo {
  title: string;
  href: string;
  pageNumber: number;
  level: 1 | 2 | 3 | 4;
  parentIndex: number | null;
}

export async function convertDocxToElpx(
  file: File,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .docx...' });
  const inputBuffer = await file.arrayBuffer();

  onProgress?.({ phase: 'parse', message: 'Analizando estilos y contenido del DOCX...' });
  const htmlValue = await extractDocxHtml(inputBuffer);
  return convertHtmlToElpx(htmlValue, file.name, options, onProgress, 'Interpretando la estructura del documento...');
}

export async function convertHtmlToElpx(
  htmlValue: string,
  filename: string,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
  parseMessage = 'Interpretando la estructura del documento...',
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'parse', message: parseMessage });
  const project = buildProjectFromHtml(htmlValue, filename, options);

  onProgress?.({ phase: 'template', message: 'Aplicando la plantilla base de eXeLearning...' });
  const template = await loadBaseTemplate();
  const elpxData = buildElpxFromTemplate(template, project);

  onProgress?.({ phase: 'pack', message: 'Generando el archivo .elpx...' });
  const blobData = new Uint8Array(elpxData);
  const blob = new Blob([blobData], { type: 'application/zip' });

  return {
    blob,
    filename: toElpxFilename(filename),
    pageCount: project.pages.length,
    blockCount: project.pages.reduce((count, page) => count + page.blocks.length, 0),
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

    if (tag === 'h1') {
      currentPage = createPage(pages, trimmed, 1, null);
      currentTopLevelPage = currentPage;
      currentSecondLevelPage = null;
      currentThirdLevelPage = null;
      currentBlock = null;
      continue;
    }

    if (tag === 'h2') {
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

    if (tag === 'h3') {
      if (options.heading2Mode !== 'page') {
        currentPage = ensurePage(pages, currentPage);
        currentBlock = ensureBlock(currentPage, currentBlock);
        currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
        continue;
      }

      if (options.heading2Mode === 'page' && options.heading3Mode === 'page') {
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

    if (tag === 'h4') {
      if (options.heading2Mode !== 'page' || options.heading3Mode !== 'page') {
        currentPage = ensurePage(pages, currentPage);
        currentBlock = ensureBlock(currentPage, currentBlock);
        currentBlock.html = appendParagraphHtml(currentBlock.html, cleanedHtml);
        continue;
      }

      if (options.heading2Mode === 'page' && options.heading3Mode === 'page' && options.heading4Mode === 'page') {
        const parentPage =
          currentThirdLevelPage ?? currentSecondLevelPage ?? currentTopLevelPage ?? ensurePage(pages, currentPage);
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
    title: stemFromFilename(filename) || 'Documento importado',
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

function generateContentXml(project: ImportedProject): string {
  const odeId = createResourceId();
  const odeVersionId = createResourceId();
  const modified = String(Date.now());
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

function generatePreviewPageHtml(project: ImportedProject, pages: PreviewPageInfo[], activeIndex: number): string {
  const activePageInfo = pages[activeIndex];
  const activePage = project.pages[activeIndex];
  const assetPrefix = activeIndex === 0 ? '' : '../';
  const prevPage = activeIndex > 0 ? pages[activeIndex - 1] : null;
  const nextPage = activeIndex < pages.length - 1 ? pages[activeIndex + 1] : null;
  const navItems = generatePreviewNavHtml(pages, activePageInfo.pageNumber, activeIndex);
  const blocks = activePage.blocks
    .map((block, blockIndex) => generatePreviewBlockHtml(block, activePageInfo.pageNumber, blockIndex))
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

function generatePreviewBlockHtml(block: ImportedBlock, pageNumber: number, blockIndex: number): string {
  const blockId = `block-preview-${pageNumber}-${blockIndex + 1}`;
  const ideviceId = `idevice-preview-${pageNumber}-${blockIndex + 1}`;

  return `<article id="${escapeHtml(blockId)}" class="box">
<header class="box-head no-icon">
<h1 class="box-title">${escapeHtml(block.title || 'Contenido')}</h1>
<button class="box-toggle box-toggle-on" title="Toggle content">
<span>Toggle content</span>
</button></header>
<div class="box-content">
<div id="${escapeHtml(ideviceId)}" class="idevice_node text" data-idevice-path="idevices/text/" data-idevice-type="text" data-idevice-component-type="json" data-idevice-json-data="{&quot;ideviceId&quot;:&quot;${escapeHtml(ideviceId)}&quot;}">
<div class="exe-text"><div class="exe-text-template">
${block.html || '<p></p>'}
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
  let output = value.replace(/\u00a0/g, ' ').replace(/\r/g, '');
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
