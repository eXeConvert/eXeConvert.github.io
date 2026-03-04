import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm does not ship TypeScript declarations.
import { gfm } from 'turndown-plugin-gfm';
import { convertElpxToHtml, type ConvertProgress } from './converter';

export interface MarkdownExportOptions {
  includeImages: boolean;
}

export interface MarkdownExportResult {
  blob: Blob;
  filename: string;
  pageCount: number;
}

export async function convertElpxToMarkdown(
  file: File,
  options: MarkdownExportOptions,
  onProgress?: (progress: ConvertProgress) => void,
): Promise<MarkdownExportResult> {
  const htmlResult = await convertElpxToHtml(file, onProgress);

  onProgress?.({ phase: 'render', message: 'Convirtiendo HTML a Markdown...' });
  const markdown = convertHtmlDocumentToMarkdown(htmlResult.html, options);

  return {
    blob: new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
    filename: toMarkdownFilename(file.name),
    pageCount: htmlResult.pageCount,
  };
}

function convertHtmlDocumentToMarkdown(html: string, options: MarkdownExportOptions): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const root = document.body;
  const title = root.querySelector('h1')?.textContent?.trim() || '';
  const subtitle = root.querySelector('.project-subtitle')?.textContent?.trim() || '';
  const sections = Array.from(root.querySelectorAll('section.page'));

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
  });
  turndown.use(gfm);

  turndown.addRule('imageHandling', {
    filter: 'img',
    replacement: (_content: string, node: Node) => {
      const element = node as HTMLImageElement;
      const alt = element.getAttribute('alt') || 'Imagen';
      const src = element.getAttribute('src') || '';
      if (!options.includeImages) {
        return alt ? `_${alt}_` : '';
      }
      return src ? `![${alt}](${src})` : alt;
    },
  });

  turndown.addRule('sectionRule', {
    filter: 'section',
    replacement: (content: string) => `\n\n${content.trim()}\n\n`,
  });

  const parts: string[] = [];
  if (title) {
    parts.push(`**${title}**`);
  }
  if (subtitle) {
    parts.push(`_${subtitle}_`);
  }

  if (sections.length === 0) {
    const markdown = turndown.turndown(root.innerHTML).trim();
    if (markdown) {
      parts.push(markdown);
    }
  } else {
    for (const section of sections) {
      const sectionMarkdown = turndown.turndown(section.innerHTML).trim();
      if (sectionMarkdown) {
        parts.push(sectionMarkdown);
      }
    }
  }

  return parts.filter(Boolean).join('\n\n').trimEnd() + '\n';
}

function toMarkdownFilename(inputName: string): string {
  const stem = inputName.replace(/\.[^.]+$/, '') || 'documento';
  return `${stem}.md`;
}
