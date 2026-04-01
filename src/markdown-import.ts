import MarkdownIt from 'markdown-it';
// @ts-expect-error markdown-it-texmath does not ship TypeScript declarations.
import texmath from 'markdown-it-texmath';
import {
  convertHtmlToElpx,
  type DocxImportOptions,
  type DocxImportProgress,
  type ImportToElpxResult,
} from './docx-import.js';

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
  breaks: false,
});

markdown.use(texmath, {
  engine: {
    renderToString(content: string, options?: { displayMode?: boolean }) {
      const trimmed = content.trim();
      return options?.displayMode ? `\\[${trimmed}\\]` : `\\(${trimmed}\\)`;
    },
  },
  delimiters: ['dollars', 'beg_end'],
});

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
