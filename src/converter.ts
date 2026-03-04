import { unzipSync } from 'fflate';
import { asBlob } from 'html-docx-js-typescript';

export interface ConvertProgress {
  phase: 'read' | 'parse' | 'render' | 'docx';
  message: string;
}

export interface ConvertResult {
  blob: Blob;
  filename: string;
  html: string;
  pageCount: number;
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
  contentHtml: string;
}

interface AssetEntry {
  zipPath: string;
  data: Uint8Array;
  mime: string;
}

const ASSET_DIRECTORIES = ['resources', 'images', 'media', 'files', 'attachments'];
const SYSTEM_FILES = new Set(['content.xml', 'contentv3.xml', 'content.data', 'content.xsd', 'imsmanifest.xml']);

export async function convertElpxToDocx(
  file: File,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<ConvertResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo .elpx...' });
  const input = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(input);

  onProgress?.({ phase: 'parse', message: 'Analizando content.xml...' });
  const project = parseProject(entries);
  const assets = collectAssets(entries);

  onProgress?.({ phase: 'render', message: 'Generando HTML intermedio...' });
  const html = buildHtmlDocument(project, assets);

  onProgress?.({ phase: 'docx', message: 'Generando el documento .docx...' });
  const generated = await asBlob(html);
  const blob = generated instanceof Blob ? generated : new Blob([generated]);

  return {
    blob,
    filename: toOutputFilename(file.name),
    html,
    pageCount: project.pages.length,
  };
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
    contentHtml: fragments.join('\n'),
  };
}

function buildHtmlDocument(project: ParsedProject, assets: Map<string, AssetEntry>): string {
  const sections = project.pages
    .map(page => {
      const content = sanitizeHtmlFragment(page.contentHtml, assets);
      if (!content.trim()) {
        return '';
      }

      return `<section class="page">
<h2>${escapeHtml(page.title)}</h2>
${content}
</section>`;
    })
    .filter(Boolean)
    .join('\n');

  return `<!doctype html>
<html lang="${escapeAttribute(project.language)}">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(project.title)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #222; line-height: 1.45; }
    h1 { font-size: 24pt; margin: 0 0 10pt; }
    h2 { font-size: 16pt; margin: 24pt 0 10pt; padding-bottom: 4pt; border-bottom: 1pt solid #d7d0c2; }
    p, li { font-size: 11pt; }
    img { max-width: 100%; height: auto; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    td, th { border: 1pt solid #bfb7a8; padding: 4pt 6pt; vertical-align: top; }
    .project-subtitle { color: #5a544a; margin: 0 0 14pt; }
    .feedback, .js-feedback, .feedbackjs { display: block !important; visibility: visible !important; }
    .sr-av, .js-hidden, .screen-reader-text { display: none !important; }
  </style>
</head>
<body>
  <h1>${escapeHtml(project.title)}</h1>
  ${project.subtitle ? `<p class="project-subtitle">${escapeHtml(project.subtitle)}</p>` : ''}
  ${sections || '<p>El proyecto no contiene contenido exportable.</p>'}
</body>
</html>`;
}

function sanitizeHtmlFragment(sourceHtml: string, assets: Map<string, AssetEntry>): string {
  if (!sourceHtml.trim()) {
    return '';
  }

  const template = document.createElement('template');
  template.innerHTML = rewriteAssetReferences(sourceHtml, assets);

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

  for (const details of Array.from(template.content.querySelectorAll('details'))) {
    details.setAttribute('open', 'open');
  }

  for (const feedback of Array.from(template.content.querySelectorAll('.feedback, .js-feedback, .feedbackjs'))) {
    feedback.removeAttribute('hidden');
    feedback.setAttribute('style', 'display:block; visibility:visible;');
  }

  for (const hidden of Array.from(template.content.querySelectorAll('[hidden]'))) {
    hidden.removeAttribute('hidden');
  }

  for (const element of Array.from(template.content.querySelectorAll<HTMLElement>('[style]'))) {
    const style = element.getAttribute('style') || '';
    const nextStyle = style
      .replace(/display\s*:\s*none\s*;?/gi, '')
      .replace(/visibility\s*:\s*hidden\s*;?/gi, '');
    if (nextStyle.trim()) {
      element.setAttribute('style', nextStyle);
    } else {
      element.removeAttribute('style');
    }
  }

  for (const anchor of Array.from(template.content.querySelectorAll('a'))) {
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('asset://')) {
      anchor.replaceWith(document.createTextNode(anchor.textContent || anchor.getAttribute('download') || 'Adjunto'));
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
    replacement.textContent = source ? `Recurso multimedia omitido: ${source}` : 'Recurso multimedia omitido.';
    media.replaceWith(replacement);
  }

  return template.innerHTML.trim();
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

  const appendBranch = (parentId: string | null) => {
    const children = childrenByParent.get(parentId) || [];
    for (const child of children) {
      if (visited.has(child.id)) {
        continue;
      }

      visited.add(child.id);
      ordered.push(child);
      appendBranch(child.id);
    }
  };

  appendBranch(null);

  for (const page of pages) {
    if (!visited.has(page.id)) {
      visited.add(page.id);
      ordered.push(page);
    }
  }

  return ordered;
}

function findPropertyValue(xmlDoc: Document, key: string): string | null {
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
  return Array.from(parent.children).filter(
    child => child instanceof Element && child.tagName === tagName,
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
  return value.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '').replace(/[?#].*$/, '');
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
