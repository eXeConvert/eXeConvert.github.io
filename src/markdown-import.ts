import MarkdownIt from 'markdown-it';
// @ts-expect-error markdown-it-texmath does not ship TypeScript declarations.
import texmath from 'markdown-it-texmath';
import {
  convertHtmlToElpx,
  type DocxImportOptions,
  type DocxImportProgress,
  type ImportToElpxResult,
} from './docx-import.js';

/*
  The PDF importer (ADR 0007) renders the Markdown that EdiMarkdown produces,
  which carries some HTML of its own (`<sup>`, `<br>` in table cells), so it
  needs `html: true`; a plain .md import keeps HTML off. Both share the formula
  rules below.
*/
export function createMarkdownRenderer({ html = false }: { html?: boolean } = {}): MarkdownIt {
  const renderer = new MarkdownIt({
    html,
    linkify: true,
    typographer: false,
    breaks: false,
  });

  renderer.use(texmath, {
    engine: {
      renderToString(content: string, options?: { displayMode?: boolean }) {
        const trimmed = content.trim();
        return options?.displayMode ? `\\[${trimmed}\\]` : `\\(${trimmed}\\)`;
      },
    },
    delimiters: ['dollars', 'brackets', 'beg_end'],
  });

  // texmath only accepts \[...\] as a block of its own, while $$...$$ also works
  // inside a paragraph. Without this rule markdown-it reads \[ and \] as escaped
  // brackets and drops the backslashes, so the formula ends up as plain text.
  const bracketDisplayRule = {
    name: 'math_inline_bracket_display',
    rex: /\\\[([\s\S]+?)\\\]/gy,
    tag: '\\[',
  };
  renderer.inline.ruler.before('escape', bracketDisplayRule.name, texmath.inline(bracketDisplayRule));

  // texmath wraps display math found inside a paragraph in <section>, which the
  // HTML parser cannot nest in <p>: it closes the paragraph there and the text
  // after the formula is lost. Keep the formula inline in the paragraph instead.
  for (const name of ['math_inline_double', bracketDisplayRule.name]) {
    renderer.renderer.rules[name] = (tokens, idx) =>
      `<eqn>${texmath.render(tokens[idx].content, true, {})}</eqn>`;
  }
  return renderer;
}

const markdown = createMarkdownRenderer();

export function renderMarkdownForTests(source: string): string {
  return markdown.render(source);
}

export async function convertMarkdownToElpx(
  file: File,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
): Promise<ImportToElpxResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el archivo Markdown...', messageKey: 'progress.readMarkdown' });
  const source = await file.text();

  onProgress?.({ phase: 'parse', message: 'Convirtiendo Markdown a HTML...', messageKey: 'progress.markdownToHtml' });
  const html = markdown.render(source);

  return convertHtmlToElpx(html, file.name, options, onProgress, 'progress.parseMarkdownStructure');
}
