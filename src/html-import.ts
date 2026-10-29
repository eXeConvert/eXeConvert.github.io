import { MathMLToLaTeX } from 'mathml-to-latex';
import {
  buildProjectFromHtml,
  convertProjectToElpx,
  type DocxImportOptions,
  type DocxImportProgress,
  type ImportedPage,
  type ImportedProject,
  type ImportToElpxResult,
} from './docx-import.js';
import {
  dirnameOf,
  findMainEntry,
  isZip,
  joinPath,
  readImageDataUrl,
  unzipDocumentEntries,
  zipEntryResolver,
  type AssetResolver,
} from './import-files.js';

// Elements whose children are laid out as blocks. When one of them holds block
// content it is only a wrapper, and the importer has to see what is inside:
// headings nested in <main> or <section> would otherwise never become pages.
const CONTAINER_TAGS = new Set([
  'div', 'section', 'article', 'main', 'header', 'footer', 'aside', 'figure',
  'center', 'form', 'hgroup', 'address', 'details', 'fieldset', 'body', 'figcaption',
]);

const BLOCK_TAGS = new Set([
  ...CONTAINER_TAGS,
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'dl', 'table', 'blockquote', 'pre', 'hr',
]);

const NON_CONTENT_SELECTOR = [
  'script', 'style', 'noscript', 'template', 'link', 'meta', 'nav', 'iframe', 'object', 'embed',
  'svg', 'canvas', 'button', 'input', 'select', 'textarea', '[hidden]',
].join(', ');

export async function convertHtmlToElpxProject(
  file: File,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
  resolveAsset?: AssetResolver,
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo HTML...', messageKey: 'progress.readHtml' });
  const data = new Uint8Array(await file.arrayBuffer());
  let project: ImportedProject;

  if (isZip(data)) {
    const entries = unzipDocumentEntries(data);
    const mainPath = findMainEntry(Object.keys(entries), /\.html?$/i, /(^|\/)index\.html?$/i);
    if (!mainPath) {
      throw new Error('No se ha encontrado ningún archivo .html dentro del .zip.');
    }
    onProgress?.({ phase: 'parse', message: 'Interpretando la estructura del HTML...', messageKey: 'progress.parseHtmlStructure' });
    const site = new SiteReader(entries);
    const sitePages = site.findPages(mainPath);
    project = sitePages.length > 1
      ? await buildSiteProject(site, sitePages, file.name, options)
      : await buildPageProject(site.document(mainPath), file.name, options, zipEntryResolver(entries, mainPath));
  } else {
    onProgress?.({ phase: 'parse', message: 'Interpretando la estructura del HTML...', messageKey: 'progress.parseHtmlStructure' });
    project = await buildPageProject(parseHtml(data), file.name, options, resolveAsset);
  }
  return convertProjectToElpx(project, file.name, undefined, onProgress, { renderLatex: true });
}

function parseHtml(data: Uint8Array): Document {
  const source = decodeHtml(data);
  if (!source.trim()) {
    throw new Error('El archivo HTML está vacío.');
  }
  // Browsers build <html> and <body> around a bare fragment; linkedom, the DOM
  // the CLI runs on, returns a document without them and cannot be queried.
  const markup = /<html[\s>]/i.test(source) ? source : `<!doctype html><html><body>${source}</body></html>`;
  const document = new DOMParser().parseFromString(markup, 'text/html');
  if (!document.body) {
    throw new Error('El archivo HTML no tiene contenido.');
  }
  return document;
}

async function buildPageProject(
  document: Document,
  filename: string,
  options: DocxImportOptions,
  resolveAsset?: AssetResolver,
): Promise<ImportedProject> {
  // The page's own <title> says more than the file name or «Página 1»: it names
  // the content before the first heading and, with no heading taken as the
  // resource title, the project.
  const pageTitle = titleOf(document);
  const { html } = await preparePageContent(document, resolveAsset);
  const project = buildProjectFromHtml(html, filename, options, pageTitle);
  if (pageTitle && project.title === stemOf(filename)) {
    project.title = pageTitle;
  }
  return project;
}

/**
 * Cleans a parsed page and returns its content as top-level blocks, with its
 * images read and its links to other pages of the site rewritten. In a site,
 * the <h1> a page opens with is its title, which eXeLearning shows by itself:
 * it is returned apart, not left to become a subpage.
 */
async function preparePageContent(
  document: Document,
  resolveAsset?: AssetResolver,
  site?: { pageLink: (href: string) => string | null },
): Promise<{ html: string; heading: string }> {
  const body = document.body;
  recoverFormulas(document);
  // A header that holds the site's menu is the site's banner, repeated on
  // every page (Google Sites puts the site name there), not content.
  for (const header of Array.from(body.querySelectorAll('header'))) {
    if (header.querySelector('nav')) {
      header.remove();
    }
  }
  for (const element of Array.from(body.querySelectorAll(NON_CONTENT_SELECTOR))) {
    element.remove();
  }
  keepMainContent(body);
  // Documentation sites follow each heading with a link to it, shown as ¶, #
  // or an icon; it would end up in the block title.
  for (const anchor of Array.from(body.querySelectorAll('h1 a[href], h2 a[href], h3 a[href], h4 a[href], h5 a[href], h6 a[href]'))) {
    if ((anchor.getAttribute('href') || '').includes('#') && !/[\p{L}\p{N}]/u.test(anchor.textContent || '')) {
      anchor.remove();
    }
  }
  let heading = '';
  const firstHeading = body.querySelector('h1');
  if (site && firstHeading && !normalizeText(textBefore(body, firstHeading))) {
    heading = normalizeText(firstHeading.textContent);
    firstHeading.remove();
  }
  convertDollarDelimiters(body);
  if (site) {
    for (const anchor of Array.from(body.querySelectorAll('a[href]'))) {
      const link = site.pageLink(anchor.getAttribute('href') || '');
      if (link) {
        anchor.setAttribute('href', link);
      }
    }
  }
  await embedImages(body, resolveAsset);
  return { html: flattenContent(body), heading };
}

// Pages that mark their content with <main> or role="main" (documentation
// sites, blogs) keep sidebars and tables of contents outside it. Google Sites
// marks only the page title that way, so the mark is trusted only when it
// holds more than headings.
function keepMainContent(body: Element): void {
  const main = body.querySelector('main, [role="main"]');
  if (!main || main === body || !main.querySelector('p, ul, ol, dl, table, pre, blockquote, figure, img')) {
    return;
  }
  for (const child of Array.from(body.childNodes)) {
    child.remove();
  }
  body.appendChild(main);
}

function textBefore(root: Node, target: Node): string {
  let text = '';
  let found = false;
  const visit = (node: Node): void => {
    if (found) return;
    if (node === target) {
      found = true;
      return;
    }
    if (node.nodeType === 3) {
      text += node.textContent || '';
    }
    for (const child of Array.from(node.childNodes)) {
      visit(child);
    }
  };
  visit(root);
  return text;
}

// A web page saved with its images is one .html in the .zip; a site, such as
// the one Google Takeout exports from Google Sites, is one .html per page.
// Only the pages reached by links from the main one belong to the site: the
// frames a browser saves next to a page are .html files nobody links to.

interface SitePage {
  path: string;
  /** What the site's menu calls the page, if it does. */
  title: string;
  /** Index of the parent page in the list, from the nesting of the menu. */
  parent: number | null;
}

class SiteReader {
  private readonly documents = new Map<string, Document | null>();

  constructor(readonly entries: Record<string, Uint8Array>) {}

  document(path: string): Document {
    const document = this.tryDocument(path);
    if (!document) {
      throw new Error(`No se ha podido leer ${path}.`);
    }
    return document;
  }

  /** The .html of the .zip a link from the page at `fromPath` leads to, if any. */
  pagePath(fromPath: string, href: string): string | null {
    const value = href.trim();
    if (!value || value.startsWith('#') || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
      return null;
    }
    let plain = value.split('#')[0].split('?')[0];
    try {
      plain = decodeURIComponent(plain);
    } catch {
      // Keep the address as written.
    }
    const path = joinPath(dirnameOf(fromPath), plain);
    return /\.html?$/i.test(path) && this.entries[path] ? path : null;
  }

  /** The pages of the site in the order and nesting of its menu, then those it leaves out as they are linked, starting from the main one. */
  findPages(mainPath: string): SitePage[] {
    const reached = [mainPath];
    for (let index = 0; index < reached.length; index += 1) {
      for (const target of this.linkedPages(reached[index])) {
        if (!reached.includes(target)) {
          reached.push(target);
        }
      }
    }
    if (reached.length === 1) {
      return [{ path: mainPath, title: '', parent: null }];
    }

    // Without an index.html the main page is just the first file, so the
    // menu decides which page opens the project.
    const pages = this.readMenu(mainPath);
    for (const path of reached) {
      if (!pages.some(page => page.path === path)) {
        pages.push({ path, title: '', parent: null });
      }
    }
    return pages;
  }

  private tryDocument(path: string): Document | null {
    if (!this.documents.has(path)) {
      let document: Document | null = null;
      try {
        document = parseHtml(this.entries[path]);
      } catch {
        // An empty or unreadable page is left out of the site.
      }
      this.documents.set(path, document);
    }
    return this.documents.get(path) ?? null;
  }

  private linkedPages(path: string): string[] {
    const document = this.tryDocument(path);
    if (!document) {
      return [];
    }
    return Array.from(document.querySelectorAll('a[href]'))
      .map(anchor => this.pagePath(path, anchor.getAttribute('href') || ''))
      .filter((target): target is string => target !== null && this.tryDocument(target) !== null);
  }

  /**
   * The site's menu in a page: the first list in a <nav> (or role="navigation")
   * that links to pages of the site or, for sites that mark nothing (such as
   * MkDocs), the first top-level list whose links lead mostly to them.
   */
  menuList(path: string): Element | null {
    const document = this.tryDocument(path);
    if (!document) {
      return null;
    }
    const pageLinks = (list: Element) => {
      const hrefs = Array.from(list.querySelectorAll('a[href]'))
        .map(anchor => anchor.getAttribute('href') || '')
        .filter(href => href && !href.startsWith('#'));
      const pages = new Set(hrefs.map(href => this.pagePath(path, href)).filter(target => target && this.tryDocument(target)));
      return { pages: pages.size, links: hrefs.length };
    };
    for (const nav of Array.from(document.querySelectorAll('nav, [role="navigation"]'))) {
      const list = nav.querySelector('ul, ol');
      if (list && pageLinks(list).pages > 0) {
        return list;
      }
    }
    for (const list of Array.from(document.body.querySelectorAll('ul, ol'))) {
      if (list.parentElement?.closest('li')) {
        continue;
      }
      const { pages, links } = pageLinks(list);
      if (pages >= 2 && pages * 2 >= links) {
        return list;
      }
    }
    return null;
  }

  /** The pages a menu links to, to tell the site's menu, repeated on every page, from a list of links in the content. */
  menuTargets(path: string): string {
    const list = this.menuList(path);
    if (!list) {
      return '';
    }
    const targets = Array.from(list.querySelectorAll('a[href]'))
      .map(anchor => this.pagePath(path, anchor.getAttribute('href') || ''))
      .filter((target): target is string => target !== null);
    return Array.from(new Set(targets)).sort().join('\n');
  }

  /** The pages of the site's menu, in its order and nesting. */
  private readMenu(path: string): SitePage[] {
    const list = this.menuList(path);
    if (!list) {
      return [];
    }
    const pages: SitePage[] = [];
    const walk = (parentList: Element, parent: number | null) => {
      for (const item of elementChildren(parentList).filter(child => tagOf(child) === 'li')) {
        // The item's own link and lists, not those of the items nested in it.
        const ownLink = Array.from(item.querySelectorAll('a[href]')).find(anchor => anchor.closest('li') === item);
        const target = ownLink ? this.pagePath(path, ownLink.getAttribute('href') || '') : null;
        let index = parent;
        // Menus repeat entries (Google Sites adds them again under «More»).
        if (target && this.tryDocument(target) && !pages.some(page => page.path === target)) {
          pages.push({ path: target, title: normalizeText(ownLink?.textContent), parent });
          index = pages.length - 1;
        }
        for (const nested of Array.from(item.querySelectorAll('ul, ol')).filter(candidate => candidate.parentElement?.closest('li') === item)) {
          walk(nested, index);
        }
      }
    };
    walk(list, null);
    return pages;
  }
}

async function buildSiteProject(
  site: SiteReader,
  sitePages: SitePage[],
  filename: string,
  options: DocxImportOptions,
): Promise<ImportedProject> {
  // Links between pages become eXeLearning's own, exe-node:<page id>.
  const ids = new Map(sitePages.map(page => [page.path, crypto.randomUUID()]));
  const pages: ImportedPage[] = [];
  const pageIndexes: number[] = [];
  let projectTitle = '';
  const siteMenu = site.menuTargets(sitePages[0].path);

  for (const sitePage of sitePages) {
    const document = site.document(sitePage.path);
    const name = sitePage.path.split('/').pop() || sitePage.path;
    // The menu is repeated on every page; it is the project's own menu now.
    if (siteMenu && site.menuTargets(sitePage.path) === siteMenu) {
      site.menuList(sitePage.path)?.remove();
    }
    const { html, heading } = await preparePageContent(document, zipEntryResolver(site.entries, sitePage.path), {
      // A link to a part of the same page has nowhere to go: the ids are not kept.
      pageLink: href => {
        const target = site.pagePath(sitePage.path, href);
        return target && target !== sitePage.path ? `exe-node:${ids.get(target)}` : null;
      },
    });
    // The menu's name is the short one; the page's <h1>, or its <title>, otherwise.
    const pageTitle = sitePage.title || heading || titleOf(document) || stemOf(name);
    // Each file is imported as a page of its own: its other headings make
    // blocks, or subpages of it, as they would in a single page.
    const imported = buildProjectFromHtml(html, name, options, pageTitle);
    projectTitle ||= titleOf(document) || imported.title;

    const parent = sitePage.parent === null ? null : pageIndexes[sitePage.parent];
    const localIndexes: number[] = [];
    imported.pages.forEach((page, localIndex) => {
      const pageParent = localIndex === 0 ? parent : localIndexes[page.parentIndex ?? 0];
      const placed = placeUnder(pages, pageParent);
      pages.push({
        ...page,
        ...(localIndex === 0 ? { id: ids.get(sitePage.path), title: pageTitle } : {}),
        level: placed.level,
        parentIndex: placed.parentIndex,
      });
      localIndexes.push(pages.length - 1);
    });
    pageIndexes.push(localIndexes[0]);
  }

  return { title: projectTitle || stemOf(filename), subtitle: '', pages };
}

/** Level and parent for a page under `parent`. eXeLearning projects made here go four levels deep; deeper pages become siblings of their parent. */
function placeUnder(pages: ImportedPage[], parent: number | null): { level: 1 | 2 | 3 | 4; parentIndex: number | null } {
  let parentIndex = parent;
  while (parentIndex !== null && pages[parentIndex].level >= 4) {
    parentIndex = pages[parentIndex].parentIndex;
  }
  const level = parentIndex === null ? 1 : pages[parentIndex].level + 1;
  return { level: level as 1 | 2 | 3 | 4, parentIndex };
}

function titleOf(document: Document): string {
  return normalizeText(document.querySelector('title')?.textContent);
}

/** How many pages of a site a .zip holds, 1 for a single web page: what the import will make of it, told before converting. */
export function countSitePages(data: Uint8Array): number {
  if (!isZip(data)) {
    return 1;
  }
  const entries = unzipDocumentEntries(data);
  const mainPath = findMainEntry(Object.keys(entries), /\.html?$/i, /(^|\/)index\.html?$/i);
  return mainPath ? new SiteReader(entries).findPages(mainPath).length : 0;
}

// Saved web pages still come in legacy encodings, and the <meta charset> is the
// only place that says so. Anything the decoder does not know falls back to UTF-8.
function decodeHtml(data: Uint8Array): string {
  const head = new TextDecoder('latin1').decode(data.subarray(0, 4096));
  const label = /<meta[^>]+charset\s*=\s*["']?\s*([\w-]+)/i.exec(head)?.[1];
  if (label) {
    try {
      return new TextDecoder(label).decode(data);
    } catch {
      // Unknown label: decode as UTF-8 below.
    }
  }
  return new TextDecoder('utf-8').decode(data);
}

/** Lifts block content out of wrappers so every heading reaches the top level, where the importer looks for pages. */
function flattenContent(root: Element): string {
  const output: string[] = [];
  let inline: string[] = [];

  const flushInline = () => {
    const html = inline.join('').trim();
    if (html) {
      output.push(`<p>${html}</p>`);
    }
    inline = [];
  };

  const visit = (parent: Element) => {
    for (const node of Array.from(parent.childNodes)) {
      if (node.nodeType === 3) {
        inline.push(escapeHtml(node.textContent || ''));
        continue;
      }
      if (node.nodeType !== 1) {
        continue;
      }
      const element = node as Element;
      const tag = tagOf(element);
      if (!BLOCK_TAGS.has(tag)) {
        inline.push(element.outerHTML);
        continue;
      }
      flushInline();
      if (CONTAINER_TAGS.has(tag)) {
        if (elementChildren(element).some(child => BLOCK_TAGS.has(tagOf(child)))) {
          visit(element);
          flushInline();
        } else if (normalizeText(element.textContent) || element.querySelector('img')) {
          output.push(`<p>${element.innerHTML.trim()}</p>`);
        }
        continue;
      }
      output.push(element.outerHTML);
    }
  };

  visit(root);
  flushInline();
  return output.join('\n');
}

// Pages that show formulas rarely keep the LaTeX in the text: MathJax and KaTeX
// replace it with their own markup, and the importer would keep only the glyphs.
// Each of them leaves the source somewhere, and that is what goes back in.
function recoverFormulas(document: Document): void {
  const body = document.body;

  // MathJax 3 only keeps an assistive MathML copy, and not always. It goes
  // first: its containers also carry the .MathJax class MathJax 2 output is
  // cleared by below.
  for (const container of Array.from(body.querySelectorAll('mjx-container'))) {
    const math = container.querySelector('math');
    const latex = math ? mathElementToLatex(math) : '';
    if (latex) {
      replaceWithFormula(container, latex, container.getAttribute('display') === 'true');
    } else {
      container.remove();
    }
  }

  // MathJax 2 keeps the source in <script type="math/tex"> next to its output.
  const texScripts = Array.from(body.querySelectorAll('script[type^="math/tex"]'));
  if (texScripts.length > 0) {
    for (const rendered of Array.from(body.querySelectorAll(
      '.MathJax_Preview, .MathJax, .MathJax_Display, .MathJax_SVG, .MathJax_SVG_Display, .MathJax_CHTML, .MathJax_MathML',
    ))) {
      rendered.remove();
    }
    for (const script of texScripts) {
      const display = /mode\s*=\s*display/i.test(script.getAttribute('type') || '');
      replaceWithFormula(script, script.textContent || '', display);
    }
  }

  // KaTeX writes the source as a TeX annotation inside its MathML copy.
  for (const selector of ['.katex-display', '.katex']) {
    for (const element of Array.from(body.querySelectorAll(selector))) {
      if (!element.parentNode) {
        continue;
      }
      const tex = element.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
      if (tex) {
        replaceWithFormula(element, tex, selector === '.katex-display');
      }
    }
  }

  for (const math of Array.from(body.querySelectorAll('math'))) {
    if (!math.parentNode) {
      continue;
    }
    const latex = mathElementToLatex(math);
    if (latex) {
      replaceWithFormula(math, latex, math.getAttribute('display') === 'block');
    }
  }
}

// Pages written for MathJax often keep $...$ and $$...$$ in their text.
// eXeLearning only looks for \(...\) and \[...\], so they are rewritten with the
// same rules Markdown uses to tell a formula from a price: the opening $ is not
// followed by a space, the closing one is not preceded by a space or followed by
// a digit, and \$ is a literal dollar sign.
const DISPLAY_DOLLARS = /(^|[^\\])\$\$([\s\S]+?)\$\$/g;
const INLINE_DOLLARS = /(^|[^\\$])\$(?![\s$])((?:[^$\\]|\\[\s\S])*?[^\s\\])\$(?![$\d])/g;
const LITERAL_TAGS = new Set(['pre', 'code', 'kbd', 'samp', 'var', 'tt']);

function convertDollarDelimiters(root: Element): void {
  const visit = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 1) {
        if (!LITERAL_TAGS.has((child as Element).tagName.toLowerCase())) {
          visit(child);
        }
        continue;
      }
      if (child.nodeType !== 3 || !child.textContent?.includes('$')) {
        continue;
      }
      const converted = child.textContent
        .replace(DISPLAY_DOLLARS, (_all, before: string, latex: string) => `${before}\\[${latex.trim()}\\]`)
        .replace(INLINE_DOLLARS, (_all, before: string, latex: string) => `${before}\\(${latex}\\)`);
      // Inside a formula \$ is LaTeX and stays; only the text around it is unescaped.
      child.textContent = converted
        .split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/)
        .map((part, index) => (index % 2 === 1 ? part : part.replace(/\\\$/g, '$')))
        .join('');
    }
  };
  visit(root);
}

function mathElementToLatex(math: Element): string {
  const annotation = math.querySelector('annotation[encoding="application/x-tex"]')?.textContent?.trim();
  if (annotation) {
    return annotation;
  }
  try {
    const source = math.outerHTML.includes('xmlns=')
      ? math.outerHTML
      : math.outerHTML.replace(/^<math\b/i, '<math xmlns="http://www.w3.org/1998/Math/MathML"');
    return MathMLToLaTeX.convert(source).trim();
  } catch {
    return '';
  }
}

function replaceWithFormula(element: Element, latex: string, display: boolean): void {
  const trimmed = latex.trim();
  const text = trimmed ? (display ? `\\[${trimmed}\\]` : `\\(${trimmed}\\)`) : '';
  element.replaceWith(element.ownerDocument.createTextNode(text));
}

async function embedImages(root: Element, resolveAsset?: AssetResolver): Promise<void> {
  for (const image of Array.from(root.querySelectorAll('img'))) {
    // Lazy-loading pages put the real address in data-src and a placeholder in src.
    const lazySource = (image.getAttribute('data-src') || '').trim();
    let src = (image.getAttribute('src') || '').trim();
    if (lazySource && (!src || src.startsWith('data:image/gif') || src.startsWith('data:image/svg'))) {
      src = lazySource;
    }

    if (/^data:image\//i.test(src) || /^https?:\/\//i.test(src)) {
      image.setAttribute('src', src);
      continue;
    }
    if (src.startsWith('//')) {
      image.setAttribute('src', `https:${src}`);
      continue;
    }

    const dataUrl = src && resolveAsset ? await readImageDataUrl(src, resolveAsset) : null;
    if (dataUrl) {
      image.setAttribute('src', dataUrl);
      continue;
    }

    // A relative path that cannot be read would leave a broken image in the
    // project; its description is still worth keeping.
    const alt = normalizeText(image.getAttribute('alt'));
    image.replaceWith(image.ownerDocument.createTextNode(alt ? `[${alt}]` : ''));
  }
}

function elementChildren(element: Element): Element[] {
  return Array.from(element.childNodes).filter((node): node is Element => node.nodeType === 1);
}

function tagOf(element: Element): string {
  return element.tagName.toLowerCase();
}

function normalizeText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function stemOf(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').trim();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
