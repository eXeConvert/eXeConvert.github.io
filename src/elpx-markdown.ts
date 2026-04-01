import TurndownService from 'turndown';
// @ts-expect-error turndown-plugin-gfm does not ship TypeScript declarations.
import { gfm } from 'turndown-plugin-gfm';
import { convertElpxToHtml, type ConvertProgress } from './converter.js';

export interface MarkdownExportOptions {
  includeImages: boolean;
  selectedPageIds?: string[];
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
  const htmlResult = await convertElpxToHtml(
    file,
    {
      selectedPageIds: options.selectedPageIds,
      // Markdown should be generated from the stable exported source, not from rendered browser output.
      useRenderedPages: false,
    },
    onProgress,
  );

  onProgress?.({ phase: 'render', message: 'Convirtiendo HTML a Markdown...', messageKey: 'progress.htmlToMarkdown' });
  const markdown = normalizeGeneratedMarkdown(convertHtmlDocumentToMarkdown(htmlResult.html, options));

  return {
    blob: new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
    filename: toMarkdownFilename(file.name),
    pageCount: htmlResult.pageCount,
  };
}

function normalizeGeneratedMarkdown(markdown: string): string {
  return markdown
    .replace(/\n{2,}\d+\n{2,}(?=#{3,6}\s)/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
}

function convertHtmlDocumentToMarkdown(html: string, options: MarkdownExportOptions): string {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const root = document.body;
  const title = root.querySelector('h1')?.textContent?.trim() || '';
  const subtitle = root.querySelector('.project-subtitle')?.textContent?.trim() || '';
  const sections = Array.from(root.querySelectorAll('section.page'));

  const turndown = createTurndownService(options);

  const parts: string[] = [];
  if (title) {
    parts.push(`**${title}**`);
  }
  if (subtitle) {
    parts.push(`_${subtitle}_`);
  }

  if (sections.length === 0) {
    const markdown = turndownFragment(root, turndown, options).trim();
    if (markdown) {
      parts.push(markdown);
    }
  } else {
    for (const section of sections) {
      const sectionMarkdown = turndownFragment(section as HTMLElement, turndown, options).trim();
      if (sectionMarkdown) {
        parts.push(sectionMarkdown);
      }
    }
  }

  return parts.filter(Boolean).join('\n\n').trimEnd() + '\n';
}

function createTurndownService(options: MarkdownExportOptions): TurndownService {
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

  return turndown;
}

function turndownFragment(root: HTMLElement, turndown: TurndownService, options: MarkdownExportOptions): string {
  const clone = root.cloneNode(true) as HTMLElement;
  const tableTokens = replaceTablesWithMarkdownTokens(clone, options);
  let markdown = turndown.turndown(clone.innerHTML);
  for (const [token, tableMarkdown] of tableTokens) {
    markdown = markdown.replace(token, `\n\n${tableMarkdown}\n\n`);
  }
  return markdown;
}

function toMarkdownFilename(inputName: string): string {
  const stem = inputName.replace(/\.[^.]+$/, '') || 'documento';
  return `${stem}.md`;
}

function replaceTablesWithMarkdownTokens(root: HTMLElement, options: MarkdownExportOptions): Map<string, string> {
  const cellTurndown = createTurndownService(options);
  const tokens = new Map<string, string>();
  const tables = Array.from(root.querySelectorAll('table')).reverse();

  tables.forEach((table, index) => {
    const markdown = tableElementToMarkdown(table, cellTurndown);
    const token = `EXE_MD_TABLE_${index}_${Math.random().toString(36).slice(2, 10)}`;
    tokens.set(token, markdown);
    table.replaceWith(root.ownerDocument.createTextNode(token));
  });

  return tokens;
}

function tableElementToMarkdown(table: HTMLTableElement, cellTurndown: TurndownService): string {
  const rows = extractTableRows(table, cellTurndown);
  if (rows.length === 0) {
    return '';
  }

  const columnCount = Math.max(...rows.map(row => row.length));
  if (columnCount === 0) {
    return '';
  }

  const normalizedRows = rows.map(row => {
    const padded = row.slice();
    while (padded.length < columnCount) {
      padded.push('');
    }
    return padded;
  });

  const header = normalizedRows[0];
  const body = normalizedRows.slice(1);
  const separator = header.map(() => '---');

  const lines = [
    `| ${header.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...body.map(row => `| ${row.join(' | ')} |`),
  ];

  return lines.join('\n');
}

function extractTableRows(table: HTMLTableElement, cellTurndown: TurndownService): string[][] {
  const rowGroups = Array.from(table.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && ['thead', 'tbody', 'tfoot'].includes(child.tagName.toLowerCase()),
  );
  const directRows =
    rowGroups.length > 0
      ? rowGroups.flatMap(group => Array.from(group.children))
      : Array.from(table.children);
  const tableRows = directRows.filter(
    (row): row is HTMLTableRowElement => row instanceof HTMLTableRowElement,
  );

  const grid: string[][] = [];
  for (const rowElement of tableRows) {
    const rowIndex = grid.length;
    const row = grid[rowIndex] || [];
    let columnIndex = 0;
    while (row[columnIndex] !== undefined) {
      columnIndex += 1;
    }

    for (const cell of Array.from(rowElement.children)) {
      if (!(cell instanceof HTMLTableCellElement)) {
        continue;
      }

      while (row[columnIndex] !== undefined) {
        columnIndex += 1;
      }

      const colspan = Math.max(1, Number.parseInt(cell.getAttribute('colspan') || '1', 10) || 1);
      const rowspan = Math.max(1, Number.parseInt(cell.getAttribute('rowspan') || '1', 10) || 1);
      const content = normalizeTableCell(cellToMarkdown(cell, cellTurndown));

      for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
        const targetRow = grid[rowIndex + rowOffset] || [];
        grid[rowIndex + rowOffset] = targetRow;
        for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
          targetRow[columnIndex + colOffset] = rowOffset === 0 && colOffset === 0 ? content : '';
        }
      }

      columnIndex += colspan;
    }
  }

  return grid.filter(row => row.some(cell => cell !== undefined && cell !== ''));
}

function cellToMarkdown(cell: HTMLTableCellElement, cellTurndown: TurndownService): string {
  const clone = cell.cloneNode(true) as HTMLElement;
  for (const nestedTable of Array.from(clone.querySelectorAll('table'))) {
    nestedTable.replaceWith(clone.ownerDocument.createTextNode(normalizeTableCell(nestedTable.textContent || '')));
  }
  return cellTurndown.turndown(clone.innerHTML);
}

function normalizeTableCell(value: string): string {
  return value
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\s+/g, ' ')
    .replace(/<br>(?:\s*<br>)+/g, '<br><br>')
    .replace(/\|/g, '\\|')
    .trim();
}
