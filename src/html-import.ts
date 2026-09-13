import { MathMLToLaTeX } from 'mathml-to-latex';
import {
  buildProjectFromHtml,
  convertProjectToElpx,
  type DocxImportOptions,
  type DocxImportProgress,
  type ImportToElpxResult,
} from './docx-import.js';
import {
  findMainEntry,
  isZip,
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
  let source: string;
  let resolver = resolveAsset;

  if (isZip(data)) {
    const entries = unzipDocumentEntries(data);
    const mainPath = findMainEntry(Object.keys(entries), /\.html?$/i, /(^|\/)index\.html?$/i);
    if (!mainPath) {
      throw new Error('No se ha encontrado ningún archivo .html dentro del .zip.');
    }
    source = decodeHtml(entries[mainPath]);
    resolver = zipEntryResolver(entries, mainPath);
  } else {
    source = decodeHtml(data);
  }

  onProgress?.({ phase: 'parse', message: 'Interpretando la estructura del HTML...', messageKey: 'progress.parseHtmlStructure' });
  if (!source.trim()) {
    throw new Error('El archivo HTML está vacío.');
  }
  // Browsers build <html> and <body> around a bare fragment; linkedom, the DOM
  // the CLI runs on, returns a document without them and cannot be queried.
  const markup = /<html[\s>]/i.test(source) ? source : `<!doctype html><html><body>${source}</body></html>`;
  const document = new DOMParser().parseFromString(markup, 'text/html');
  const body = document.body;
  if (!body) {
    throw new Error('El archivo HTML no tiene contenido.');
  }

  recoverFormulas(document);
  for (const element of Array.from(body.querySelectorAll(NON_CONTENT_SELECTOR))) {
    element.remove();
  }
  await embedImages(body, resolver);

  const project = buildProjectFromHtml(flattenContent(body), file.name, options);
  // With no heading taken as the resource title, the project is named after the
  // file; the page's own <title> says more.
  const pageTitle = normalizeText(document.querySelector('title')?.textContent);
  if (pageTitle && project.title === stemOf(file.name)) {
    project.title = pageTitle;
  }
  return convertProjectToElpx(project, file.name, undefined, onProgress, { renderLatex: true });
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
