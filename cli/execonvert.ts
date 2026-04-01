import { basename, dirname, extname, resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stderr, stdout } from 'node:process';

import { createI18n, type Locale } from '../src/i18n.js';
import {
  buildPrintableHtmlDocument,
  buildPdfBlobFromPrintableHtml,
  convertElpxToDocx,
  convertElpxToHtml,
  convertHtmlToDocxResult,
  inspectElpxPages,
} from '../src/converter.js';
import { convertDocxToElpx } from '../src/docx-import.js';
import { convertElpxToMarkdown } from '../src/elpx-markdown.js';
import { convertElpToElpx } from '../src/legacy-elp.js';
import { convertMarkdownToElpx } from '../src/markdown-import.js';
import { installCliRuntime } from './runtime.js';

type InspectPage = {
  id: string;
  parentId: string | null;
  title: string;
  depth: number;
  ref: string;
};

type StructureValue = 'page' | 'subpage' | 'idevice' | 'resource-title';

type StructureOptions = {
  h1: StructureValue;
  h2: Exclude<StructureValue, 'resource-title'>;
  h3: Exclude<StructureValue, 'resource-title'>;
  h4: Exclude<StructureValue, 'resource-title'>;
};

type ParsedArgs = {
  command: 'convert' | 'inspect' | 'help' | 'version';
  inputPath?: string;
  outputPath?: string;
  locale: Locale;
  json: boolean;
  includeImages: boolean;
  h1: StructureValue;
  h2: Exclude<StructureValue, 'resource-title'>;
  h3: Exclude<StructureValue, 'resource-title'>;
  h4: Exclude<StructureValue, 'resource-title'>;
  pages: string[];
  pageIds: string[];
};

const CLI_VERSION = '0.1.1';

type ProgressLike = {
  phase: string;
  message: string;
  messageKey?: string;
};

type CliTranslator = {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

type ConsoleMethod = (...args: unknown[]) => void;

const cliMessages: Record<Locale, Record<string, string>> = {
  es: {
    'help.title': 'CLI de eXeConvert',
    'help.versionLine': 'Versión: {version}',
    'help.usage': 'Uso',
    'help.inputs': 'Entradas compatibles',
    'help.outputs': 'Salidas compatibles',
    'help.options': 'Opciones',
    'help.examples': 'Ejemplos',
    'help.input.elp': '.elp',
    'help.input.elpx': '.elpx',
    'help.input.docx': '.docx',
    'help.input.markdown': '.md, .txt',
    'help.output.elp': 'desde .elp: .elpx, .md, .docx, .pdf',
    'help.output.elpx': 'desde .elpx: .md, .docx, .pdf',
    'help.output.docx': 'desde .docx: .elpx',
    'help.output.markdown': 'desde .md/.txt: .elpx',
    'help.option.json': 'Imprime JSON legible por máquina',
    'help.option.pages': 'Exporta solo las referencias de página seleccionadas de un .elpx',
    'help.option.pageId': 'Exporta solo el identificador interno de página indicado (repetible)',
    'help.option.pageIds': 'Exporta solo los identificadores internos de página indicados',
    'help.option.images': 'Mantiene imágenes embebidas al exportar .elpx a Markdown',
    'help.option.h1': 'page | resource-title',
    'help.option.h2': 'idevice | subpage',
    'help.option.h3': 'idevice | subpage',
    'help.option.h4': 'idevice | subpage',
    'help.option.lang': 'es | ca | en',
    'help.option.help': 'Muestra esta ayuda',
    'help.option.version': 'Muestra la versión',
    'error.inspectArity': 'inspect espera exactamente un archivo de entrada.',
    'error.convertArity': 'convert espera exactamente un archivo de entrada y uno de salida.',
    'error.unknownOption': 'Opción desconocida: {value}',
    'error.missingValue': 'Falta un valor para {flag}.',
    'error.invalidValue': 'Valor no válido "{value}". Valores permitidos: {allowed}.',
    'error.h3RequiresH2': '--h3 subpage requiere --h2 subpage.',
    'error.h4RequiresH3': '--h4 subpage requiere --h3 subpage.',
    'error.unsupportedExtension': 'Extensión de archivo no compatible: {extension}.',
    'error.unknownPageRef': 'Referencia de página desconocida: {ref}',
    'error.unsupportedConversion': 'Conversión no compatible: {input} -> {output}',
    'error.prefix': 'Error: {message}',
    'result.written': 'Escrito {output}',
    'progress.generatePdf': 'Generando el documento .pdf...',
    'progress.composePdf': 'Componiendo el documento .pdf...',
  },
  ca: {
    'help.title': 'CLI d’eXeConvert',
    'help.versionLine': 'Versió: {version}',
    'help.usage': 'Ús',
    'help.inputs': 'Entrades compatibles',
    'help.outputs': 'Sortides compatibles',
    'help.options': 'Opcions',
    'help.examples': 'Exemples',
    'help.input.elp': '.elp',
    'help.input.elpx': '.elpx',
    'help.input.docx': '.docx',
    'help.input.markdown': '.md, .txt',
    'help.output.elp': 'des de .elp: .elpx, .md, .docx, .pdf',
    'help.output.elpx': 'des de .elpx: .md, .docx, .pdf',
    'help.output.docx': 'des de .docx: .elpx',
    'help.output.markdown': 'des de .md/.txt: .elpx',
    'help.option.json': 'Imprimeix JSON llegible per màquines',
    'help.option.pages': 'Exporta només les referències de pàgina seleccionades d’un .elpx',
    'help.option.pageId': 'Exporta només l’identificador intern de pàgina indicat (repetible)',
    'help.option.pageIds': 'Exporta només els identificadors interns de pàgina indicats',
    'help.option.images': 'Manté imatges incrustades en exportar .elpx a Markdown',
    'help.option.h1': 'page | resource-title',
    'help.option.h2': 'idevice | subpage',
    'help.option.h3': 'idevice | subpage',
    'help.option.h4': 'idevice | subpage',
    'help.option.lang': 'es | ca | en',
    'help.option.help': 'Mostra aquesta ajuda',
    'help.option.version': 'Mostra la versió',
    'error.inspectArity': 'inspect espera exactament un fitxer d’entrada.',
    'error.convertArity': 'convert espera exactament un fitxer d’entrada i un de sortida.',
    'error.unknownOption': 'Opció desconeguda: {value}',
    'error.missingValue': 'Falta un valor per a {flag}.',
    'error.invalidValue': 'Valor no vàlid "{value}". Valors permesos: {allowed}.',
    'error.h3RequiresH2': '--h3 subpage requereix --h2 subpage.',
    'error.h4RequiresH3': '--h4 subpage requereix --h3 subpage.',
    'error.unsupportedExtension': 'Extensió de fitxer no compatible: {extension}.',
    'error.unknownPageRef': 'Referència de pàgina desconeguda: {ref}',
    'error.unsupportedConversion': 'Conversió no compatible: {input} -> {output}',
    'error.prefix': 'Error: {message}',
    'result.written': 'S’ha escrit {output}',
    'progress.generatePdf': 'S’està generant el document .pdf...',
    'progress.composePdf': 'S’està component el document .pdf...',
  },
  en: {
    'help.title': 'eXeConvert CLI',
    'help.versionLine': 'Version: {version}',
    'help.usage': 'Usage',
    'help.inputs': 'Supported inputs',
    'help.outputs': 'Supported outputs',
    'help.options': 'Options',
    'help.examples': 'Examples',
    'help.input.elp': '.elp',
    'help.input.elpx': '.elpx',
    'help.input.docx': '.docx',
    'help.input.markdown': '.md, .txt',
    'help.output.elp': 'from .elp: .elpx, .md, .docx, .pdf',
    'help.output.elpx': 'from .elpx: .md, .docx, .pdf',
    'help.output.docx': 'from .docx: .elpx',
    'help.output.markdown': 'from .md/.txt: .elpx',
    'help.option.json': 'Print machine-readable JSON',
    'help.option.pages': 'Export only selected page refs from an .elpx input',
    'help.option.pageId': 'Export only the given internal page id (repeatable)',
    'help.option.pageIds': 'Export only the given internal page ids',
    'help.option.images': 'Keep embedded images when exporting .elpx to Markdown',
    'help.option.h1': 'page | resource-title',
    'help.option.h2': 'idevice | subpage',
    'help.option.h3': 'idevice | subpage',
    'help.option.h4': 'idevice | subpage',
    'help.option.lang': 'es | ca | en',
    'help.option.help': 'Show this help',
    'help.option.version': 'Show the version',
    'error.inspectArity': 'inspect expects exactly one input file.',
    'error.convertArity': 'convert expects exactly one input file and one output file.',
    'error.unknownOption': 'Unknown option: {value}',
    'error.missingValue': 'Missing value for {flag}.',
    'error.invalidValue': 'Invalid value "{value}". Allowed values: {allowed}.',
    'error.h3RequiresH2': '--h3 subpage requires --h2 subpage.',
    'error.h4RequiresH3': '--h4 subpage requires --h3 subpage.',
    'error.unsupportedExtension': 'Unsupported file extension: {extension}.',
    'error.unknownPageRef': 'Unknown page ref: {ref}',
    'error.unsupportedConversion': 'Unsupported conversion: {input} -> {output}',
    'error.prefix': 'Error: {message}',
    'result.written': 'Written {output}',
    'progress.generatePdf': 'Generating the .pdf document...',
    'progress.composePdf': 'Composing the .pdf document...',
  },
};

function createCliTranslator(locale: Locale): CliTranslator {
  const { t: baseT } = createI18n(locale);
  const dictionary = cliMessages[locale] ?? cliMessages.en;
  const fallback = cliMessages.en;

  return {
    locale,
    t(key, vars) {
      const template = dictionary[key] ?? fallback[key];
      if (!template) {
        return baseT(key, vars);
      }
      if (!vars) {
        return template;
      }
      return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, name: string) => {
        const value = vars[name];
        return value === undefined ? '' : String(value);
      });
    },
  };
}

function normalizeLocaleToken(value: string | undefined): Locale | null {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith('ca')) return 'ca';
  if (normalized.startsWith('es')) return 'es';
  if (normalized.startsWith('en')) return 'en';
  return null;
}

function resolveCliLocale(argv: string[]): Locale {
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if ((value === '--lang' || value === '--locale') && index + 1 < argv.length) {
      return normalizeLocaleToken(argv[index + 1]) ?? 'en';
    }
    if (value.startsWith('--lang=')) {
      return normalizeLocaleToken(value.slice('--lang='.length)) ?? 'en';
    }
    if (value.startsWith('--locale=')) {
      return normalizeLocaleToken(value.slice('--locale='.length)) ?? 'en';
    }
  }

  return (
    normalizeLocaleToken(process.env.LC_ALL) ??
    normalizeLocaleToken(process.env.LC_MESSAGES) ??
    normalizeLocaleToken(process.env.LANG) ??
    'en'
  );
}

function printHelp(t: CliTranslator['t']): void {
  stdout.write(`${t('help.title')}
${t('help.versionLine', { version: CLI_VERSION })}

${t('help.usage')}:
  execonvert <input> <output> [options]
  execonvert inspect <input> [--json]

${t('help.inputs')}:
  ${t('help.input.elp')}
  ${t('help.input.elpx')}
  ${t('help.input.docx')}
  ${t('help.input.markdown')}

${t('help.outputs')}:
  ${t('help.output.elp')}
  ${t('help.output.elpx')}
  ${t('help.output.docx')}
  ${t('help.output.markdown')}

${t('help.options')}:
  --json                  ${t('help.option.json')}
  --pages 1,2.1           ${t('help.option.pages')}
  --page-id <id>          ${t('help.option.pageId')}
  --page-ids a,b,c        ${t('help.option.pageIds')}
  --images                ${t('help.option.images')}
  --h1 <mode>             ${t('help.option.h1')}
  --h2 <mode>             ${t('help.option.h2')}
  --h3 <mode>             ${t('help.option.h3')}
  --h4 <mode>             ${t('help.option.h4')}
  --lang <code>           ${t('help.option.lang')}
  --help                  ${t('help.option.help')}
  --version               ${t('help.option.version')}

${t('help.examples')}:
  execonvert notes.md notes.elpx --h1 resource-title --h2 subpage --h3 idevice
  execonvert project.elpx project.docx --pages 1,2.1
  execonvert project.elpx project.pdf --pages 1,2.1
  execonvert inspect project.elpx --json
`);
}

function parseArgs(argv: string[], t: CliTranslator['t'], locale: Locale): ParsedArgs {
  const defaults: ParsedArgs = {
    command: 'convert',
    locale,
    json: false,
    includeImages: false,
    h1: 'page',
    h2: 'idevice',
    h3: 'idevice',
    h4: 'idevice',
    pages: [],
    pageIds: [],
  };

  const args = [...argv];
  if (args.includes('--version') || args.includes('-V')) {
    return { ...defaults, command: 'version' };
  }

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { ...defaults, command: 'help' };
  }

  if (args[0] === 'inspect') {
    args.shift();
    const parsed = parseOptionFlags(args, defaults, t);
    if (parsed.positionals.length !== 1) {
      throw new Error(t('error.inspectArity'));
    }
    return {
      ...defaults,
      ...parsed.options,
      command: 'inspect',
      inputPath: parsed.positionals[0],
    };
  }

  const parsed = parseOptionFlags(args, defaults, t);
  if (parsed.positionals.length !== 2) {
    throw new Error(t('error.convertArity'));
  }

  return {
    ...defaults,
    ...parsed.options,
    command: 'convert',
    inputPath: parsed.positionals[0],
    outputPath: parsed.positionals[1],
  };
}

function parseOptionFlags(args: string[], defaults: ParsedArgs, t: CliTranslator['t']): {
  options: Partial<ParsedArgs>;
  positionals: string[];
} {
  const positionals: string[] = [];
  const options: Partial<ParsedArgs> = {
    json: defaults.json,
    includeImages: defaults.includeImages,
    h1: defaults.h1,
    h2: defaults.h2,
    h3: defaults.h3,
    h4: defaults.h4,
    pages: [],
    pageIds: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith('--')) {
      positionals.push(value);
      continue;
    }

    const nextValue = args[index + 1];
    switch (value) {
      case '--lang':
      case '--locale':
        ensureOptionValue(value, nextValue, t);
        options.locale = normalizeLocaleToken(nextValue) ?? 'en';
        index += 1;
        break;
      case '--json':
        options.json = true;
        break;
      case '--images':
        options.includeImages = true;
        break;
      case '--pages':
        ensureOptionValue(value, nextValue, t);
        options.pages = mergeCsvValues(options.pages ?? [], nextValue);
        index += 1;
        break;
      case '--page-id':
        ensureOptionValue(value, nextValue, t);
        options.pageIds = [...(options.pageIds ?? []), nextValue];
        index += 1;
        break;
      case '--page-ids':
        ensureOptionValue(value, nextValue, t);
        options.pageIds = mergeCsvValues(options.pageIds ?? [], nextValue);
        index += 1;
        break;
      case '--h1':
        ensureOptionValue(value, nextValue, t);
        options.h1 = parseStructureValue(nextValue, ['page', 'resource-title'], t);
        index += 1;
        break;
      case '--h2':
        ensureOptionValue(value, nextValue, t);
        options.h2 = parseStructureValue(nextValue, ['idevice', 'subpage'], t);
        index += 1;
        break;
      case '--h3':
        ensureOptionValue(value, nextValue, t);
        options.h3 = parseStructureValue(nextValue, ['idevice', 'subpage'], t);
        index += 1;
        break;
      case '--h4':
        ensureOptionValue(value, nextValue, t);
        options.h4 = parseStructureValue(nextValue, ['idevice', 'subpage'], t);
        index += 1;
        break;
      default:
        throw new Error(t('error.unknownOption', { value }));
    }
  }

  return { options, positionals };
}

function ensureOptionValue(flag: string, value: string | undefined, t: CliTranslator['t']): asserts value is string {
  if (!value || value.startsWith('--')) {
    throw new Error(t('error.missingValue', { flag }));
  }
}

function mergeCsvValues(current: string[], raw: string): string[] {
  return [...current, ...raw.split(',').map(part => part.trim()).filter(Boolean)];
}

function parseStructureValue<T extends StructureValue>(value: string, allowed: T[], t: CliTranslator['t']): T {
  const normalized = value.trim().toLowerCase() as T;
  if (!allowed.includes(normalized)) {
    throw new Error(t('error.invalidValue', { value, allowed: allowed.join(', ') }));
  }
  return normalized;
}

function validateStructure(structure: StructureOptions, t: CliTranslator['t']): void {
  if (structure.h3 === 'subpage' && structure.h2 !== 'subpage') {
    throw new Error(t('error.h3RequiresH2'));
  }
  if (structure.h4 === 'subpage' && structure.h3 !== 'subpage') {
    throw new Error(t('error.h4RequiresH3'));
  }
}

function detectFormat(filePath: string, t: CliTranslator['t']): 'elp' | 'elpx' | 'docx' | 'markdown' | 'pdf' {
  const extension = extname(filePath).toLowerCase();
  switch (extension) {
    case '.elp':
      return 'elp';
    case '.elpx':
      return 'elpx';
    case '.docx':
      return 'docx';
    case '.pdf':
      return 'pdf';
    case '.md':
    case '.markdown':
    case '.mdown':
    case '.txt':
      return 'markdown';
    default:
      throw new Error(t('error.unsupportedExtension', { extension: extension || '(none)' }));
  }
}

async function readInputFile(path: string, mime: string): Promise<File> {
  const resolved = resolve(path);
  const data = await readFile(resolved);
  return new File([data], basename(resolved), { type: mime });
}

async function writeBlob(path: string, blob: Blob): Promise<void> {
  const resolved = resolve(path);
  await mkdir(dirname(resolved), { recursive: true });
  await writeFile(resolved, Buffer.from(await blob.arrayBuffer()));
}

function buildMime(format: 'elp' | 'elpx' | 'docx' | 'markdown' | 'pdf'): string {
  switch (format) {
    case 'elp':
    case 'elpx':
      return 'application/zip';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'markdown':
      return 'text/markdown;charset=utf-8';
    case 'pdf':
      return 'application/pdf';
  }
}

function progressLogger(progress: ProgressLike, i18n: CliTranslator): void {
  const phaseMessages: Record<string, string> = {
    'Generando el documento .pdf...': i18n.t('progress.generatePdf'),
    'Componiendo el documento .pdf...': i18n.t('progress.composePdf'),
  };
  const localizedMessage = progress.messageKey ? i18n.t(progress.messageKey) : (phaseMessages[progress.message] || progress.message);
  const signature = `${progress.phase}:${localizedMessage}`;
  if (signature === lastProgressSignature) {
    return;
  }
  lastProgressSignature = signature;
  stderr.write(`[${progress.phase}] ${localizedMessage}\n`);
}

function buildPageRefs(pages: Array<{ id: string; parentId: string | null; title: string; depth: number }>): InspectPage[] {
  const baseDepth = pages.length > 0 ? Math.min(...pages.map(page => page.depth)) : 0;
  const counters: number[] = [];
  return pages.map(page => {
    const normalizedDepth = Math.max(0, page.depth - baseDepth);
    counters[normalizedDepth] = (counters[normalizedDepth] ?? 0) + 1;
    counters.length = normalizedDepth + 1;
    return {
      ...page,
      ref: counters.slice(0, normalizedDepth + 1).join('.'),
    };
  });
}

function resolveSelectedPageIds(pages: InspectPage[], refs: string[], ids: string[]): string[] {
  const selected = new Set(ids);
  if (refs.length === 0) {
    return [...selected];
  }

  const refMap = new Map(pages.map(page => [page.ref, page.id]));
  for (const ref of refs) {
    const pageId = refMap.get(ref);
    if (!pageId) {
      throw new Error(currentCliTranslator.t('error.unknownPageRef', { ref }));
    }
    selected.add(pageId);
  }
  return [...selected];
}

function printInspectText(pages: InspectPage[]): void {
  const baseDepth = pages.length > 0 ? Math.min(...pages.map(page => page.depth)) : 0;
  for (const page of pages) {
    const indent = '  '.repeat(Math.max(0, page.depth - baseDepth));
    stdout.write(`${page.ref} ${indent}${page.title}\n`);
  }
}

async function runInspect(inputPath: string, json: boolean): Promise<void> {
  installCliRuntime();
  const inputFile = await readInputFile(inputPath, buildMime('elpx'));
  const pages = buildPageRefs(await inspectElpxPages(inputFile));

  if (json) {
    stdout.write(`${JSON.stringify({ input: resolve(inputPath), pages }, null, 2)}\n`);
    return;
  }

  printInspectText(pages);
}

async function runConvert(args: ParsedArgs): Promise<void> {
  installCliRuntime();
  const i18n = createCliTranslator(args.locale);
  const inputPath = args.inputPath!;
  const outputPath = args.outputPath!;
  const inputFormat = detectFormat(inputPath, i18n.t);
  const outputFormat = detectFormat(outputPath, i18n.t);
  const inputFile = await readInputFile(inputPath, buildMime(inputFormat));
  const selectedPageIds = inputFormat === 'elpx'
    ? await loadSelectedPageIds(inputFile, args.pages, args.pageIds)
    : [];

  validateStructure({
    h1: args.h1,
    h2: args.h2,
    h3: args.h3,
    h4: args.h4,
  }, i18n.t);

  if (inputFormat === 'elpx' && outputFormat === 'docx') {
    const result = await convertElpxToDocx(
      inputFile,
      selectedPageIds.length > 0 ? { selectedPageIds } : undefined,
      progress => progressLogger(progress, i18n),
    );
    await writeBlob(outputPath, result.blob);
    printConvertResult(args.json, {
      input: resolve(inputPath),
      output: resolve(outputPath),
      inputFormat,
      outputFormat,
      pageCount: result.pageCount,
    }, i18n.t);
    return;
  }

  if (inputFormat === 'elpx' && outputFormat === 'markdown') {
    const result = await convertElpxToMarkdown(
      inputFile,
      {
        includeImages: args.includeImages,
        selectedPageIds: selectedPageIds.length > 0 ? selectedPageIds : undefined,
      },
      progress => progressLogger(progress, i18n),
    );
    await writeBlob(outputPath, result.blob);
    printConvertResult(args.json, {
      input: resolve(inputPath),
      output: resolve(outputPath),
      inputFormat,
      outputFormat,
      pageCount: result.pageCount,
    }, i18n.t);
    return;
  }

  if (inputFormat === 'elpx' && outputFormat === 'pdf') {
    const htmlResult = await convertElpxToHtml(
      inputFile,
      selectedPageIds.length > 0 ? { selectedPageIds, useRenderedPages: false } : { useRenderedPages: false },
      progress => progressLogger(progress, i18n),
    );
    const blob = await buildPdfBlobFromPrintableHtml(
      buildPrintableHtmlDocument(htmlResult.html, { title: basename(outputPath) }),
      { title: basename(outputPath) },
      progress => progressLogger(progress, i18n),
    );
    await writeBlob(outputPath, blob);
    printConvertResult(args.json, {
      input: resolve(inputPath),
      output: resolve(outputPath),
      inputFormat,
      outputFormat,
      pageCount: htmlResult.pageCount,
    }, i18n.t);
    return;
  }

  if (inputFormat === 'docx' && outputFormat === 'elpx') {
    const result = await convertDocxToElpx(
      inputFile,
      {
        heading1Mode: args.h1 === 'resource-title' ? 'resource' : 'page',
        heading2Mode: args.h2 === 'subpage' ? 'page' : 'block',
        heading3Mode: args.h3 === 'subpage' ? 'page' : 'block',
        heading4Mode: args.h4 === 'subpage' ? 'page' : 'block',
      },
      progress => progressLogger(progress, i18n),
    );
    await writeBlob(outputPath, result.blob);
    printConvertResult(args.json, {
      input: resolve(inputPath),
      output: resolve(outputPath),
      inputFormat,
      outputFormat,
      pageCount: result.pageCount,
      blockCount: result.blockCount,
    }, i18n.t);
    return;
  }

  if (inputFormat === 'markdown' && outputFormat === 'elpx') {
    const result = await convertMarkdownToElpx(
      inputFile,
      {
        heading1Mode: args.h1 === 'resource-title' ? 'resource' : 'page',
        heading2Mode: args.h2 === 'subpage' ? 'page' : 'block',
        heading3Mode: args.h3 === 'subpage' ? 'page' : 'block',
        heading4Mode: args.h4 === 'subpage' ? 'page' : 'block',
      },
      progress => progressLogger(progress, i18n),
    );
    await writeBlob(outputPath, result.blob);
    printConvertResult(args.json, {
      input: resolve(inputPath),
      output: resolve(outputPath),
      inputFormat,
      outputFormat,
      pageCount: result.pageCount,
      blockCount: result.blockCount,
    }, i18n.t);
    return;
  }

  if (inputFormat === 'elp') {
    const intermediate = await convertElpToElpx(
      inputFile,
      progress => progressLogger(progress, i18n),
    );

    if (outputFormat === 'elpx') {
      await writeBlob(outputPath, intermediate.blob);
      printConvertResult(args.json, {
        input: resolve(inputPath),
        output: resolve(outputPath),
        inputFormat,
        outputFormat,
        pageCount: intermediate.pageCount,
        blockCount: intermediate.blockCount,
      }, i18n.t);
      return;
    }

    const intermediateFile = new File(
      [intermediate.blob],
      intermediate.filename,
      { type: buildMime('elpx') },
    );
    const elpxSelectedPageIds = await loadSelectedPageIds(intermediateFile, args.pages, args.pageIds);

    if (outputFormat === 'markdown') {
      const result = await convertElpxToMarkdown(
        intermediateFile,
        {
          includeImages: args.includeImages,
          selectedPageIds: elpxSelectedPageIds.length > 0 ? elpxSelectedPageIds : undefined,
        },
        progress => progressLogger(progress, i18n),
      );
      await writeBlob(outputPath, result.blob);
      printConvertResult(args.json, {
        input: resolve(inputPath),
        output: resolve(outputPath),
        inputFormat,
        outputFormat,
        pageCount: result.pageCount,
      }, i18n.t);
      return;
    }

    if (outputFormat === 'pdf') {
      const htmlResult = await convertElpxToHtml(
        intermediateFile,
        elpxSelectedPageIds.length > 0 ? { selectedPageIds: elpxSelectedPageIds, useRenderedPages: false } : { useRenderedPages: false },
        progress => progressLogger(progress, i18n),
      );
      const blob = await buildPdfBlobFromPrintableHtml(
        buildPrintableHtmlDocument(htmlResult.html, { title: basename(outputPath) }),
        { title: basename(outputPath) },
        progress => progressLogger(progress, i18n),
      );
      await writeBlob(outputPath, blob);
      printConvertResult(args.json, {
        input: resolve(inputPath),
        output: resolve(outputPath),
        inputFormat,
        outputFormat,
        pageCount: htmlResult.pageCount,
      }, i18n.t);
      return;
    }

    if (outputFormat === 'docx') {
      const htmlResult = await convertElpxToHtml(
        intermediateFile,
        elpxSelectedPageIds.length > 0 ? { selectedPageIds: elpxSelectedPageIds, useRenderedPages: true } : { useRenderedPages: true },
        progress => progressLogger(progress, i18n),
      );
      const result = await convertHtmlToDocxResult(
        htmlResult.html,
        {
          inputName: inputFile.name,
          title: htmlResult.title,
          language: htmlResult.language,
          pageCount: htmlResult.pageCount,
        },
        progress => progressLogger(progress, i18n),
      );
      await writeBlob(outputPath, result.blob);
      printConvertResult(args.json, {
        input: resolve(inputPath),
        output: resolve(outputPath),
        inputFormat,
        outputFormat,
        pageCount: result.pageCount,
      }, i18n.t);
      return;
    }
  }

  throw new Error(i18n.t('error.unsupportedConversion', { input: inputFormat, output: outputFormat }));
}

async function loadSelectedPageIds(inputFile: File, pageRefs: string[], pageIds: string[]): Promise<string[]> {
  if (pageRefs.length === 0 && pageIds.length === 0) {
    return [];
  }

  const pages = buildPageRefs(await inspectElpxPages(inputFile));
  return resolveSelectedPageIds(pages, pageRefs, pageIds);
}

function printConvertResult(json: boolean, payload: Record<string, unknown>, t: CliTranslator['t']): void {
  if (json) {
    stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  stdout.write(`${t('result.written', { output: String(payload.output) })}\n`);
}

let currentCliTranslator = createCliTranslator('en');
let lastProgressSignature = '';

function formatConsoleArgs(args: unknown[]): string {
  return args.map(value => (typeof value === 'string' ? value : String(value))).join(' ');
}

function shouldSuppressCliConsoleMessage(message: string): boolean {
  const normalized = message.trim();
  return (
    normalized.startsWith('[SharedImporters]') ||
    normalized.startsWith('[SharedExporters]') ||
    normalized.startsWith('[BrowserAssetProvider]') ||
    normalized.startsWith('[BaseExporter] Internal link target not found:')
  );
}

function installCliConsoleFilter(): void {
  const wrap = (original: ConsoleMethod): ConsoleMethod =>
    (...args: unknown[]) => {
      const message = formatConsoleArgs(args);
      if (shouldSuppressCliConsoleMessage(message)) {
        return;
      }
      original(...args);
    };

  console.log = wrap(console.log.bind(console));
  console.warn = wrap(console.warn.bind(console));
}

async function main(): Promise<void> {
  const locale = resolveCliLocale(process.argv.slice(2));
  currentCliTranslator = createCliTranslator(locale);
  installCliConsoleFilter();
  const args = parseArgs(process.argv.slice(2), currentCliTranslator.t, locale);
  lastProgressSignature = '';
  if (args.command === 'help') {
    printHelp(currentCliTranslator.t);
    return;
  }
  if (args.command === 'version') {
    stdout.write(`${CLI_VERSION}\n`);
    return;
  }
  if (args.command === 'inspect') {
    await runInspect(args.inputPath!, args.json);
    return;
  }
  await runConvert(args);
}

await main().catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  stderr.write(`${currentCliTranslator.t('error.prefix', { message })}\n`);
  process.exit(1);
});
