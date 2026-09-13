import { parse } from '@unified-latex/unified-latex-util-parse';
import { printRaw } from '@unified-latex/unified-latex-util-print-raw';
import type * as Ast from '@unified-latex/unified-latex-types';
import {
  buildProjectFromHtml,
  convertProjectToElpx,
  type DocxImportOptions,
  type DocxImportProgress,
  type ImportToElpxResult,
} from './docx-import.js';
import {
  dirnameOf,
  findMainEntry,
  IMAGE_EXTENSIONS,
  isZip,
  joinPath,
  readImageDataUrl,
  unzipDocumentEntries,
  zipEntryResolver,
  type AssetResolver,
} from './import-files.js';

export interface LatexImportResult extends ImportToElpxResult {
  /** LaTeX commands and environments that had no conversion; their text was kept. */
  unrecognized: string[];
}

type Language = 'es' | 'ca' | 'en';

// Only what a LaTeX document prints by itself, in the language babel sets.
const WORDS: Record<Language, { figure: string; table: string; proof: string; abstract: string; image: string }> = {
  es: { figure: 'Figura', table: 'Tabla', proof: 'Demostración', abstract: 'Resumen', image: 'Imagen' },
  ca: { figure: 'Figura', table: 'Taula', proof: 'Demostració', abstract: 'Resum', image: 'Imatge' },
  en: { figure: 'Figure', table: 'Table', proof: 'Proof', abstract: 'Abstract', image: 'Image' },
};

const SECTION_RANKS: Record<string, number> = {
  part: -1, chapter: 0, section: 1, subsection: 2, subsubsection: 3,
};

// Display environments become \[...\] with the matching MathJax-friendly inner
// environment: eXeLearning and every preview look for \( and \[, never for a
// bare \begin{align}.
const MATH_ENVIRONMENTS: Record<string, string | null> = {
  equation: null, displaymath: null, math: null,
  align: 'aligned', flalign: 'aligned', alignat: 'alignedat', gather: 'gathered', multline: 'gathered', eqnarray: 'eqnarray',
};

const INLINE_WRAPPERS: Record<string, string> = {
  textbf: 'strong', textit: 'em', emph: 'em', textsl: 'em', underline: 'u', uline: 'u',
  texttt: 'code', textsuperscript: 'sup', textsubscript: 'sub', alert: 'strong', structure: 'strong',
};

// Commands the parser does not know the arguments of, mostly from beamer. Their
// braced arguments are gathered by hand, or they would be read as loose text.
const UNPARSED_ARGUMENT_COUNTS: Record<string, number> = {
  frame: 1, frametitle: 1, framesubtitle: 1, column: 1, alert: 1, structure: 1, only: 1, onslide: 1, uncover: 1,
  visible: 1, invisible: 1, alt: 2, usetheme: 1, usecolortheme: 1, usefonttheme: 1, useinnertheme: 1,
  useoutertheme: 1, setbeamertemplate: 2, setbeamercolor: 2, setbeamerfont: 2, institute: 1, subtitle: 1, logo: 1,
  titlegraphic: 1, AtBeginSection: 1, AtBeginSubsection: 1,
};

// Declarations that change the font of the rest of their group: {\bf text}.
const FONT_DECLARATIONS: Record<string, string | null> = {
  bf: 'strong', bfseries: 'strong', it: 'em', itshape: 'em', em: 'em', sl: 'em', slshape: 'em',
  tt: 'code', ttfamily: 'code', rm: null, rmfamily: null, sf: null, sffamily: null, sc: null, scshape: null,
  normalfont: null, upshape: null, mdseries: null, tiny: null, scriptsize: null, footnotesize: null, small: null,
  normalsize: null, large: null, Large: null, LARGE: null, huge: null, Huge: null,
  centering: null, raggedright: null, raggedleft: null, color: null,
};

// Commands whose last argument is simply text to keep.
const TRANSPARENT_MACROS = new Set([
  'textrm', 'textsf', 'textsc', 'textup', 'textmd', 'textnormal', 'text', 'mbox', 'makebox', 'fbox', 'framebox',
  'hbox', 'textcolor', 'colorbox', 'highlight', 'hl', 'enquote', 'foreignlanguage', 'textlatin', 'MakeUppercase',
  'MakeLowercase', 'uppercase', 'lowercase', 'nolinkurl', 'parbox', 'raisebox', 'scalebox', 'resizebox',
  'only', 'onslide', 'uncover', 'visible', 'invisible',
]);

// Commands that print nothing worth keeping in a web page.
const IGNORED_MACROS = new Set([
  'documentclass', 'usepackage', 'RequirePackage', 'title', 'author', 'date', 'maketitle', 'tableofcontents',
  'listoffigures', 'listoftables', 'label', 'index', 'glossary', 'newpage', 'clearpage', 'cleardoublepage', 'pagebreak',
  'nopagebreak', 'linebreak', 'nolinebreak', 'vspace', 'hspace', 'vfill', 'hfill', 'smallskip', 'medskip', 'bigskip',
  'noindent', 'indent', 'setlength', 'addtolength', 'setcounter', 'addtocounter', 'stepcounter', 'refstepcounter',
  'pagestyle', 'thispagestyle', 'pagenumbering', 'geometry', 'hypersetup', 'graphicspath', 'bibliographystyle',
  'bibliography', 'addbibresource', 'printbibliography', 'newtheorem', 'theoremstyle', 'newcommand', 'renewcommand',
  'providecommand', 'DeclareMathOperator', 'def', 'let', 'newenvironment', 'renewenvironment', 'newcounter',
  'numberwithin', 'appendix', 'frontmatter', 'mainmatter', 'backmatter', 'selectlanguage', 'setdefaultlanguage',
  'setotherlanguage', 'setmainfont', 'setsansfont', 'setmonofont', 'definecolor', 'lstset', 'captionsetup',
  'setlist', 'protect', 'relax', 'null', 'centering', 'raggedright', 'raggedleft', 'makeatletter', 'makeatother',
  'phantomsection', 'addcontentsline', 'markboth', 'markright', 'FloatBarrier', 'hline', 'cline', 'toprule',
  'midrule', 'bottomrule', 'cmidrule', 'endfirsthead', 'endhead', 'endfoot', 'endlastfoot', 'strut', '@', '-', '/',
  'allowbreak', 'break', 'nobreak', 'sloppy', 'fussy', 'filbreak', 'enlargethispage', 'balance', 'ignorespaces',
  'titlepage', 'pause', 'usetheme', 'usecolortheme', 'usefonttheme', 'useinnertheme', 'useoutertheme',
  'setbeamertemplate', 'setbeamercolor', 'setbeamerfont', 'institute', 'subtitle', 'logo', 'titlegraphic',
  'AtBeginSection', 'AtBeginSubsection', 'column', 'textwidth', 'linewidth', 'textheight', 'columnwidth',
]);

const SYMBOLS: Record<string, string> = {
  '%': '%', '&': '&', $: '$', '#': '#', _: '_', '{': '{', '}': '}', ' ': ' ', ',': ' ', ';': ' ', ':': ' ',
  '!': '', ldots: '…', dots: '…', textellipsis: '…', textbackslash: '\\', textasciitilde: '~', textasciicircum: '^',
  textbar: '|', textless: '<', textgreater: '>', textquotedblleft: '“', textquotedblright: '”', textquoteleft: '‘',
  textquoteright: '’', textendash: '–', textemdash: '—', textbullet: '•', textperiodcentered: '·', S: '§', P: '¶',
  copyright: '©', textcopyright: '©', textregistered: '®', texttrademark: '™', euro: '€', EUR: '€', texteuro: '€',
  pounds: '£', textdegree: '°', degree: '°', celsius: '°C', guillemotleft: '«', guillemotright: '»', flqq: '«', frqq: '»',
  i: 'ı', j: 'ȷ', ss: 'ß', o: 'ø', O: 'Ø', ae: 'æ', AE: 'Æ', oe: 'œ', OE: 'Œ', aa: 'å', AA: 'Å', l: 'ł', L: 'Ł',
  LaTeX: 'LaTeX', TeX: 'TeX', LaTeXe: 'LaTeX2ε', quad: ' ', qquad: '  ', enspace: ' ',
  thinspace: ' ', textvisiblespace: '␣', dag: '†', ddag: '‡', checkmark: '✓', textdollar: '$', textunderscore: '_',
};

// Combining marks for the accent commands: \'a, \~n, \c{c}...
const ACCENTS: Record<string, string> = {
  "'": '\u0301', '`': '\u0300', '^': '\u0302', '"': '\u0308', '~': '\u0303', '=': '\u0304', '.': '\u0307',
  c: '\u0327', v: '\u030C', u: '\u0306', H: '\u030B', r: '\u030A', k: '\u0328', d: '\u0323', b: '\u0331',
};

const LIST_ENVIRONMENTS: Record<string, string> = { itemize: 'ul', enumerate: 'ol', description: 'ul', compactitem: 'ul', compactenum: 'ol', inparaenum: 'ol' };
const TABLE_ENVIRONMENTS = new Set(['tabular', 'tabular*', 'tabularx', 'tabulary', 'longtable', 'tabu', 'array', 'supertabular']);
const VERBATIM_ENVIRONMENTS = new Set(['verbatim', 'verbatim*', 'lstlisting', 'minted', 'Verbatim', 'alltt', 'comment']);
const SKIPPED_ENVIRONMENTS = new Set(['comment', 'thebibliography', 'titlepage']);
const PLACEHOLDER_ENVIRONMENTS = new Set(['tikzpicture', 'pgfpicture', 'picture', 'pspicture', 'forest', 'circuitikz']);

type Piece =
  | { kind: 'text'; value: string }
  | { kind: 'html'; value: string }
  | { kind: 'block'; value: string }
  | { kind: 'par' };

interface Theorem {
  label: string;
  counter: string | null;
}

export async function convertLatexToElpx(
  file: File,
  options: DocxImportOptions,
  onProgress?: (progress: DocxImportProgress) => void,
  resolveAsset?: AssetResolver,
): Promise<LatexImportResult> {
  onProgress?.({ phase: 'read', message: 'Leyendo el documento LaTeX...', messageKey: 'progress.readLatex' });
  const data = new Uint8Array(await file.arrayBuffer());
  let source: string;
  let resolver = resolveAsset;

  if (isZip(data)) {
    const entries = unzipDocumentEntries(data);
    const texFiles = Object.keys(entries).filter(name => /\.tex$/i.test(name));
    // The main file is the one that starts a document; the rest are \input pieces.
    const standalone = texFiles.filter(name => /\\documentclass|\\begin\s*\{document\}/.test(decodeTex(entries[name])));
    const found = findMainEntry(standalone.length > 0 ? standalone : texFiles, /\.tex$/i, /(^|\/)main\.tex$/i);
    if (!found) {
      throw new Error('No se ha encontrado ningún archivo .tex dentro del .zip.');
    }
    source = decodeTex(entries[found]);
    resolver = zipEntryResolver(entries, found);
  } else {
    source = decodeTex(data);
  }
  if (!source.trim()) {
    throw new Error('El documento LaTeX está vacío.');
  }

  onProgress?.({ phase: 'parse', message: 'Interpretando la estructura del documento LaTeX...', messageKey: 'progress.parseLatexStructure' });
  source = await resolveInputs(stripComments(source), resolver, '', 0);
  const definitions = extractDefinitions(source);
  const expanded = expandMacros(definitions.source, definitions.macros);

  const converter = new LatexConverter(expanded, definitions.theorems, resolver);
  const html = await converter.convert();

  const project = buildProjectFromHtml(html, file.name, options);
  if (converter.title && project.title === stemOf(file.name)) {
    project.title = converter.title;
  }
  const result = await convertProjectToElpx(project, file.name, undefined, onProgress, { renderLatex: true });
  return { ...result, unrecognized: converter.unrecognized() };
}

// LaTeX sources predate UTF-8 everywhere; inputenc with latin1 is still common.
function decodeTex(data: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch {
    return new TextDecoder('latin1').decode(data);
  }
}

/**
 * Removes % comments the way TeX reads them: the comment takes the end of its
 * line with it, and the indentation of the next one, unless that line is empty
 * and so still ends the paragraph. Verbatim text keeps its % signs.
 */
function stripComments(source: string): string {
  let output = '';
  let index = 0;
  while (index < source.length) {
    const verbatim = /^\\begin\s*\{(verbatim\*?|lstlisting|minted|Verbatim|alltt|comment)\}/.exec(source.slice(index, index + 40));
    if (verbatim) {
      const end = source.indexOf(`\\end{${verbatim[1]}}`, index);
      const stop = end < 0 ? source.length : end + `\\end{${verbatim[1]}}`.length;
      output += source.slice(index, stop);
      index = stop;
      continue;
    }
    const char = source[index];
    if (char === '\\') {
      const verb = /^\\verb\*?([^a-zA-Z\s*])/.exec(source.slice(index, index + 8));
      if (verb) {
        const close = source.indexOf(verb[1], index + verb[0].length);
        const stop = close < 0 ? source.length : close + 1;
        output += source.slice(index, stop);
        index = stop;
        continue;
      }
      output += source.slice(index, index + 2);
      index += 2;
      continue;
    }
    if (char === '%') {
      const lineEnd = source.indexOf('\n', index);
      if (lineEnd < 0) {
        break;
      }
      let next = lineEnd + 1;
      while (source[next] === ' ' || source[next] === '\t') next += 1;
      index = source[next] === '\n' || next >= source.length ? lineEnd : next;
      continue;
    }
    output += char;
    index += 1;
  }
  return output;
}

async function resolveInputs(source: string, resolver: AssetResolver | undefined, baseDir: string, depth: number): Promise<string> {
  if (!resolver || depth > 8) {
    return source;
  }
  const pattern = /\\(?:input|include|subfile)\s*(?:\{([^}]+)\}|([^\s{}\\]+))/g;
  let output = '';
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const name = (match[1] || match[2] || '').trim();
    // Only .tex files are read, whatever the document asks for.
    const path = /\.tex$/i.test(name) ? name : `${name}.tex`;
    const data = await resolver(joinPath(baseDir, path));
    output += source.slice(last, match.index);
    if (data) {
      const included = stripComments(decodeTex(data));
      output += `\n${await resolveInputs(included, resolver, dirnameOf(joinPath(baseDir, path)) , depth + 1)}\n`;
    } else {
      output += match[0];
    }
    last = (match.index ?? 0) + match[0].length;
  }
  return output + source.slice(last);
}

interface MacroDefinition {
  args: number;
  defaultArg: string | null;
  body: string;
}

/** Reads \newcommand, \def and \DeclareMathOperator definitions, and \newtheorem environments, out of the source. */
function extractDefinitions(source: string): { source: string; macros: Map<string, MacroDefinition>; theorems: Map<string, Theorem> } {
  const macros = new Map<string, MacroDefinition>();
  const theorems = new Map<string, Theorem>();
  let output = '';
  let index = 0;
  const definitionStart = /\\(newcommand|renewcommand|providecommand|DeclareRobustCommand|DeclareMathOperator|def|newtheorem)(\*?)/g;

  while (index < source.length) {
    definitionStart.lastIndex = index;
    const match = definitionStart.exec(source);
    if (!match || /[a-zA-Z]/.test(source[match.index + match[0].length] ?? '')) {
      if (!match) {
        output += source.slice(index);
        break;
      }
      output += source.slice(index, match.index + match[0].length);
      index = match.index + match[0].length;
      continue;
    }
    output += source.slice(index, match.index);
    const reader = new SourceReader(source, match.index + match[0].length);
    const [, command, star] = match;

    if (command === 'newtheorem') {
      const env = reader.group();
      const shared = reader.optional();
      const label = reader.group();
      reader.optional();
      if (env !== null && label !== null) {
        theorems.set(env.trim(), { label: label.trim(), counter: star ? null : (shared?.trim() || env.trim()) });
      }
    } else {
      const name = command === 'def' ? reader.controlSequence() : reader.groupOrControlSequence();
      if (name) {
        if (command === 'DeclareMathOperator') {
          const body = reader.group();
          if (body !== null) {
            macros.set(name, { args: 0, defaultArg: null, body: `\\operatorname${star}{${body}}` });
          }
        } else if (command === 'def') {
          const parameters = reader.until('{');
          const body = reader.group();
          if (body !== null) {
            macros.set(name, { args: (parameters.match(/#\d/g) || []).length, defaultArg: null, body });
          }
        } else {
          const count = reader.optional();
          const defaultArg = reader.optional();
          const body = reader.group();
          if (body !== null && (command !== 'providecommand' || !macros.has(name))) {
            macros.set(name, { args: Number.parseInt(count || '0', 10) || 0, defaultArg, body });
          }
        }
      }
    }
    index = reader.position;
  }
  return { source: output, macros, theorems };
}

/** Replaces uses of the document's own macros with their bodies, so formulas reach MathJax in plain LaTeX. */
function expandMacros(source: string, macros: Map<string, MacroDefinition>): string {
  if (macros.size === 0) {
    return source;
  }
  const names = [...macros.keys()].sort((left, right) => right.length - left.length).map(escapeRegExp);
  const pattern = new RegExp(`\\\\(${names.join('|')})(?![a-zA-Z])`, 'g');
  let current = source;
  // Macros may use other macros. A bounded number of passes stops recursive ones,
  // and the size limit stops one that doubles itself on every pass.
  const limit = Math.max(source.length * 20, 1_000_000);
  for (let pass = 0; pass < 12 && current.length < limit; pass += 1) {
    let changed = false;
    let output = '';
    let last = 0;
    pattern.lastIndex = 0;
    for (let match = pattern.exec(current); match; match = pattern.exec(current)) {
      const definition = macros.get(match[1])!;
      const reader = new SourceReader(current, match.index + match[0].length);
      const args: string[] = [];
      if (definition.defaultArg !== null) {
        args.push(reader.optional() ?? definition.defaultArg);
      }
      while (args.length < definition.args) {
        args.push(reader.argument() ?? '');
      }
      const body = definition.body.replace(/#(\d)/g, (_all, digit: string) => args[Number(digit) - 1] ?? '');
      output += current.slice(last, match.index) + (/^[a-zA-Z]/.test(current[reader.position] ?? '') && /\\[a-zA-Z]+$/.test(body) ? `${body} ` : body);
      last = reader.position;
      pattern.lastIndex = reader.position;
      changed = true;
    }
    if (!changed) {
      break;
    }
    current = output + current.slice(last);
  }
  return current;
}

class SourceReader {
  constructor(private readonly source: string, public position: number) {}

  private skipSpace(): void {
    while (/\s/.test(this.source[this.position] ?? '')) this.position += 1;
  }

  group(): string | null {
    this.skipSpace();
    if (this.source[this.position] !== '{') {
      return null;
    }
    return this.balanced('{', '}');
  }

  optional(): string | null {
    const start = this.position;
    this.skipSpace();
    if (this.source[this.position] !== '[') {
      this.position = start;
      return null;
    }
    return this.balanced('[', ']');
  }

  controlSequence(): string | null {
    this.skipSpace();
    const match = /^\\([a-zA-Z@]+|.)/.exec(this.source.slice(this.position));
    if (!match) {
      return null;
    }
    this.position += match[0].length;
    return match[1];
  }

  groupOrControlSequence(): string | null {
    this.skipSpace();
    if (this.source[this.position] === '{') {
      const inner = this.group();
      return inner ? inner.trim().replace(/^\\/, '') : null;
    }
    return this.controlSequence();
  }

  /** A macro argument: a braced group, a control sequence or a single character. */
  argument(): string | null {
    this.skipSpace();
    const char = this.source[this.position];
    if (char === undefined) return null;
    if (char === '{') return this.group();
    if (char === '\\') {
      const name = this.controlSequence();
      return name === null ? null : `\\${name}`;
    }
    this.position += 1;
    return char;
  }

  until(char: string): string {
    const end = this.source.indexOf(char, this.position);
    const stop = end < 0 ? this.source.length : end;
    const text = this.source.slice(this.position, stop);
    this.position = stop;
    return text;
  }

  private balanced(open: string, close: string): string | null {
    let depth = 0;
    const start = this.position + 1;
    for (let index = this.position; index < this.source.length; index += 1) {
      const char = this.source[index];
      if (char === '\\') {
        index += 1;
        continue;
      }
      if (char === open) depth += 1;
      if (char === close) {
        depth -= 1;
        if (depth === 0) {
          this.position = index + 1;
          return this.source.slice(start, index);
        }
      }
    }
    return null;
  }
}

class LatexConverter {
  title = '';
  private readonly root: Ast.Root;
  private readonly language: Language;
  private readonly topRank: number;
  private readonly frameLevel: number;
  private readonly sectionCounters: number[] = [];
  private readonly counters = new Map<string, number>();
  private readonly labels = new Map<string, string>();
  private readonly footnotes: string[] = [];
  private readonly missing = new Set<string>();
  private footnoteCount = 0;
  private graphicsPaths: string[] = [''];
  private pendingLabelTarget: string | null = null;

  constructor(
    private readonly source: string,
    private readonly theorems: Map<string, Theorem>,
    private readonly resolver: AssetResolver | undefined,
  ) {
    try {
      this.root = parse(source);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`No se ha podido interpretar el documento LaTeX: ${reason}`);
    }
    this.language = detectLanguage(source);
    const ranks = [...source.matchAll(/\\(part|chapter|section|subsection|subsubsection)\*?\s*[[{]/g)].map(match => SECTION_RANKS[match[1]]);
    this.topRank = ranks.length > 0 ? Math.min(...ranks) : 1;
    // Beamer slides sit one level below the deepest sectioning the deck uses.
    this.frameLevel = ranks.length > 0 ? Math.min(Math.max(...ranks) - this.topRank + 2, 6) : 1;
    for (const match of source.matchAll(/\\graphicspath\s*\{((?:\s*\{[^}]*\})+)\s*\}/g)) {
      this.graphicsPaths = [...match[1].matchAll(/\{([^}]*)\}/g)].map(path => path[1]).concat('');
    }
  }

  unrecognized(): string[] {
    return [...this.missing].sort();
  }

  async convert(): Promise<string> {
    const titleMacro = findMacro(this.root.content, 'title');
    if (titleMacro) {
      this.title = normalizeText(htmlToText(await this.inline(lastRequiredArg(titleMacro))));
    }
    const document = findEnvironment(this.root.content, 'document');
    const body = await this.flow(document ? document.content : this.root.content);
    const html = body + this.flushFootnotes();
    // References may point forward, so they are resolved once every label is known.
    return html.replace(/ REF:([^ ]*) /g, (_all, key: string) => escapeHtml(this.labels.get(key) ?? '??'));
  }

  /** Renders nodes as block HTML, grouping text into paragraphs. */
  private async flow(nodes: Ast.Node[]): Promise<string> {
    const blocks: string[] = [];
    let inline: Piece[] = [];
    const flush = () => {
      const html = piecesToHtml(inline).trim();
      if (html) {
        blocks.push(`<p>${html}</p>`);
      }
      inline = [];
    };
    for (const piece of await this.pieces(nodes)) {
      if (piece.kind === 'par') {
        flush();
      } else if (piece.kind === 'block') {
        flush();
        blocks.push(piece.value);
      } else {
        inline.push(piece);
      }
    }
    flush();
    return blocks.join('\n');
  }

  /** Renders nodes as inline HTML: titles, captions, table cells. */
  private async inline(nodes: Ast.Node[]): Promise<string> {
    const pieces = (await this.pieces(nodes)).map(piece =>
      piece.kind === 'par' ? { kind: 'text' as const, value: ' ' } : piece.kind === 'block' ? { kind: 'html' as const, value: piece.value } : piece,
    );
    return piecesToHtml(pieces).trim();
  }

  private async pieces(nodes: Ast.Node[]): Promise<Piece[]> {
    const output: Piece[] = [];
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      switch (node.type) {
        case 'string':
          output.push({ kind: 'text', value: node.content });
          break;
        case 'whitespace':
          output.push({ kind: 'text', value: ' ' });
          break;
        case 'parbreak':
          output.push({ kind: 'par' });
          break;
        case 'comment':
          if (node.leadingWhitespace) output.push({ kind: 'text', value: ' ' });
          break;
        case 'inlinemath':
          output.push({ kind: 'text', value: `\\(${this.mathSource(node)}\\)` });
          break;
        case 'displaymath':
          output.push({ kind: 'text', value: `\\[${this.mathSource(node)}\\]` });
          break;
        case 'mathenv':
          output.push({ kind: 'text', value: this.displayEnvironment(envName(node), innerSource(this.source, node)) });
          break;
        case 'verb':
          output.push({ kind: 'html', value: `<code>${escapeHtml(node.content)}</code>` });
          break;
        case 'verbatim':
          if (node.env !== 'comment') {
            output.push({ kind: 'block', value: `<pre><code>${escapeHtml(node.content.replace(/^\n/, ''))}</code></pre>` });
          }
          break;
        case 'group':
          output.push(...(await this.group(node)));
          break;
        case 'macro': {
          const accent = ACCENTS[node.content];
          if (accent && !node.args?.some(arg => arg.content.length > 0)) {
            // \'a: the parser leaves the accented letter as the next node.
            const next = nodes[index + 1];
            if (next?.type === 'string') {
              output.push({ kind: 'text', value: `${next.content[0]}${accent}`.normalize('NFC') + next.content.slice(1) });
              index += 1;
              break;
            }
            if (next?.type === 'group') {
              output.push({ kind: 'text', value: `${htmlToText(await this.inline(next.content))}${accent}`.normalize('NFC') });
              index += 1;
              break;
            }
          }
          if (!node.args?.length && node.content in UNPARSED_ARGUMENT_COUNTS) {
            const gathered = gatherArguments(nodes, index + 1, UNPARSED_ARGUMENT_COUNTS[node.content]);
            index = gathered.next - 1;
            output.push(...(await this.macro({ ...node, args: gathered.args })));
            break;
          }
          output.push(...(await this.macro(node)));
          break;
        }
        case 'environment':
          output.push(...(await this.environment(node)));
          break;
        default:
          break;
      }
    }
    return output;
  }

  private async group(node: Ast.Group): Promise<Piece[]> {
    const first = node.content.find(child => child.type !== 'whitespace');
    if (first?.type === 'macro' && first.content in FONT_DECLARATIONS) {
      const rest = node.content.slice(node.content.indexOf(first) + 1);
      const tag = FONT_DECLARATIONS[first.content];
      const inner = await this.inline(rest);
      return [{ kind: 'html', value: tag ? `<${tag}>${inner}</${tag}>` : inner }];
    }
    return this.pieces(node.content);
  }

  private async macro(node: Ast.Macro): Promise<Piece[]> {
    const name = node.content;

    if (name in SECTION_RANKS) {
      return [{ kind: 'block', value: this.flushFootnotes() + (await this.heading(node)) }];
    }
    if (name === 'paragraph' || name === 'subparagraph') {
      return [{ kind: 'par' }, { kind: 'html', value: `<strong>${await this.inline(lastRequiredArg(node))}</strong> ` }];
    }
    if (name in INLINE_WRAPPERS) {
      const tag = INLINE_WRAPPERS[name];
      return [{ kind: 'html', value: `<${tag}>${await this.inline(lastRequiredArg(node))}</${tag}>` }];
    }
    if (name in SYMBOLS) {
      return [{ kind: 'text', value: SYMBOLS[name] }];
    }
    if (name in FONT_DECLARATIONS || IGNORED_MACROS.has(name)) {
      if (name === 'label') {
        this.registerLabel(node);
      }
      return [];
    }

    switch (name) {
      case '\\':
      case 'newline':
      case 'tabularnewline':
        return [{ kind: 'html', value: '<br />' }];
      case 'par':
        return [{ kind: 'par' }];
      case 'item':
        return this.pieces(lastArgContent(node));
      case 'today':
        return [{ kind: 'text', value: new Date().toLocaleDateString(this.language) }];
      case 'href': {
        const [url, text] = requiredArgs(node);
        const target = printRaw(url ?? []).trim();
        return [{ kind: 'html', value: `<a href="${escapeHtml(target)}">${text ? await this.inline(text) : escapeHtml(target)}</a>` }];
      }
      case 'url': {
        const target = printRaw(lastRequiredArg(node)).trim();
        return [{ kind: 'html', value: `<a href="${escapeHtml(target)}">${escapeHtml(target)}</a>` }];
      }
      case 'footnote': {
        this.footnoteCount += 1;
        this.footnotes.push(`<p><sup>${this.footnoteCount}</sup> ${await this.inline(lastRequiredArg(node))}</p>`);
        return [{ kind: 'html', value: `<sup>${this.footnoteCount}</sup>` }];
      }
      case 'ref':
      case 'autoref':
      case 'cref':
      case 'Cref':
      case 'pageref':
      case 'nameref':
        return [{ kind: 'text', value: ` REF:${printRaw(lastRequiredArg(node)).trim()} ` }];
      case 'eqref':
        return [{ kind: 'text', value: `( REF:${printRaw(lastRequiredArg(node)).trim()} )` }];
      case 'cite':
      case 'citep':
      case 'citet':
      case 'parencite':
      case 'textcite':
        return [{ kind: 'text', value: `[${printRaw(lastRequiredArg(node)).trim()}]` }];
      case 'includegraphics':
        return [{ kind: 'html', value: await this.image(printRaw(lastRequiredArg(node)).trim()) }];
      case 'caption':
        return [];
      case 'frame':
        return [{ kind: 'block', value: await this.frame(lastRequiredArg(node), null) }];
      case 'frametitle':
        return [{ kind: 'block', value: this.flushFootnotes() + `<h${this.frameLevel}>${await this.inline(lastRequiredArg(node))}</h${this.frameLevel}>` }];
      case 'framesubtitle':
        return [{ kind: 'block', value: `<p><em>${await this.inline(lastRequiredArg(node))}</em></p>` }];
      default:
        break;
    }

    if (TRANSPARENT_MACROS.has(name)) {
      return this.pieces(lastRequiredArg(node));
    }
    // An unknown command keeps its text: losing a word is worse than losing its formatting.
    this.missing.add(`\\${name}`);
    return node.args ? this.pieces(lastRequiredArg(node)) : [];
  }

  private async environment(node: Ast.Environment): Promise<Piece[]> {
    const name = envName(node);
    const base = name.replace(/\*$/, '');

    if (base in MATH_ENVIRONMENTS) {
      return [{ kind: 'text', value: this.displayEnvironment(name, innerSource(this.source, node)) }];
    }
    if (name in LIST_ENVIRONMENTS) {
      return [{ kind: 'block', value: await this.list(node, LIST_ENVIRONMENTS[name], name === 'description') }];
    }
    if (TABLE_ENVIRONMENTS.has(name)) {
      return [{ kind: 'block', value: await this.table(node) }];
    }
    if (VERBATIM_ENVIRONMENTS.has(name)) {
      return name === 'comment' ? [] : [{ kind: 'block', value: `<pre><code>${escapeHtml(printRaw(node.content).replace(/^\n/, ''))}</code></pre>` }];
    }
    if (SKIPPED_ENVIRONMENTS.has(name)) {
      return [];
    }
    if (PLACEHOLDER_ENVIRONMENTS.has(name)) {
      this.missing.add(name);
      return [{ kind: 'block', value: `<p>[${escapeHtml(name)}]</p>` }];
    }

    switch (base) {
      case 'document':
      case 'center':
      case 'flushleft':
      case 'flushright':
      case 'minipage':
      case 'multicols':
      case 'subfigure':
      case 'adjustbox':
      case 'landscape':
      case 'small':
      case 'footnotesize':
      case 'otherlanguage':
        return [{ kind: 'block', value: await this.flow(node.content) }];
      case 'quote':
      case 'quotation':
      case 'verse':
        return [{ kind: 'block', value: `<blockquote>${await this.flow(node.content)}</blockquote>` }];
      case 'abstract':
        return [{ kind: 'block', value: `<p><strong>${WORDS[this.language].abstract}</strong></p>\n${await this.flow(node.content)}` }];
      case 'figure':
      case 'wrapfigure':
      case 'SCfigure':
        return [{ kind: 'block', value: await this.float(node, 'figure') }];
      case 'table':
      case 'wraptable':
        return [{ kind: 'block', value: await this.float(node, 'table') }];
      case 'proof':
        return [{ kind: 'block', value: await this.theorem(node, { label: WORDS[this.language].proof, counter: null }) }];
      case 'frame': {
        const title = node.args?.filter(arg => arg.openMark === '{' && arg.content.length > 0).pop()?.content ?? null;
        return [{ kind: 'block', value: await this.frame(node.content, title) }];
      }
      case 'block':
      case 'alertblock':
      case 'exampleblock': {
        const declared = node.args?.filter(arg => arg.openMark === '{').pop()?.content;
        const { group, rest } = declared ? { group: declared, rest: node.content } : takeLeadingGroup(node.content);
        const title = group && group.length > 0 ? `<p><strong>${await this.inline(group)}</strong></p>\n` : '';
        return [{ kind: 'block', value: title + (await this.flow(rest)) }];
      }
      case 'columns':
        return [{ kind: 'block', value: await this.flow(node.content) }];
      case 'column':
        return [{ kind: 'block', value: await this.flow(takeLeadingGroup(node.content).rest) }];
      default:
        break;
    }

    const theorem = this.theorems.get(name) ?? this.theorems.get(base);
    if (theorem) {
      return [{ kind: 'block', value: await this.theorem(node, theorem) }];
    }
    this.missing.add(name);
    return [{ kind: 'block', value: await this.flow(node.content) }];
  }

  private async frame(content: Ast.Node[], title: Ast.Node[] | null): Promise<string> {
    const { group, rest } = title ? { group: title, rest: content } : takeLeadingGroup(content);
    const heading = group && group.length > 0 ? `<h${this.frameLevel}>${await this.inline(group)}</h${this.frameLevel}>\n` : '';
    return this.flushFootnotes() + heading + (await this.flow(rest));
  }

  private async heading(node: Ast.Macro): Promise<string> {
    const rank = SECTION_RANKS[node.content];
    const starred = printRaw(node.args?.[0]?.content ?? []).trim() === '*';
    const level = Math.min(Math.max(rank - this.topRank + 1, 1), 6);
    if (!starred) {
      const depth = rank - this.topRank;
      this.sectionCounters[depth] = (this.sectionCounters[depth] ?? 0) + 1;
      this.sectionCounters.length = depth + 1;
      this.pendingLabelTarget = this.sectionCounters.map(count => count ?? 0).join('.');
    }
    return `<h${level}>${await this.inline(lastRequiredArg(node))}</h${level}>`;
  }

  private async list(node: Ast.Environment, tag: string, description: boolean): Promise<string> {
    const items: string[] = [];
    for (const child of node.content) {
      if (child.type !== 'macro' || child.content !== 'item') {
        continue;
      }
      const label = child.args?.find(arg => arg.openMark === '[' && arg.content.length > 0);
      let body = await this.flow(lastArgContent(child));
      // A single paragraph needs no <p> inside its list item.
      if (/^<p>((?!<p>)[\s\S])*<\/p>$/.test(body)) {
        body = body.slice(3, -4);
      }
      const prefix = label ? (description ? `<strong>${await this.inline(label.content)}</strong> ` : `${await this.inline(label.content)} `) : '';
      items.push(`<li>${prefix}${body}</li>`);
    }
    return items.length > 0 ? `<${tag}>\n${items.join('\n')}\n</${tag}>` : '';
  }

  private async table(node: Ast.Environment): Promise<string> {
    const rows: Ast.Node[][][] = [[[]]];
    for (const child of node.content) {
      const row = rows[rows.length - 1];
      if (child.type === 'macro' && (child.content === '\\' || child.content === 'tabularnewline')) {
        rows.push([[]]);
      } else if (child.type === 'string' && child.content === '&') {
        row.push([]);
      } else {
        row[row.length - 1].push(child);
      }
    }

    const htmlRows: string[] = [];
    for (const row of rows) {
      const cells: string[] = [];
      for (const cell of row) {
        const multicolumn = cell.find((item): item is Ast.Macro => item.type === 'macro' && item.content === 'multicolumn');
        const content = multicolumn ? lastRequiredArg(multicolumn) : cell;
        const span = multicolumn ? Number.parseInt(printRaw(requiredArgs(multicolumn)[0] ?? []), 10) || 1 : 1;
        // Spans do not survive the import, so the columns they cover stay as empty cells.
        cells.push(`<td>${await this.inline(content)}</td>`, ...Array.from({ length: span - 1 }, () => '<td></td>'));
      }
      if (cells.some(cell => cell !== '<td></td>')) {
        htmlRows.push(`<tr>${cells.join('')}</tr>`);
      }
    }
    return htmlRows.length > 0 ? `<table>\n<tbody>\n${htmlRows.join('\n')}\n</tbody>\n</table>` : '';
  }

  private async float(node: Ast.Environment, kind: 'figure' | 'table'): Promise<string> {
    const number = this.nextCount(kind);
    this.pendingLabelTarget = number;
    const parts: string[] = [];
    const visit = async (nodes: Ast.Node[]): Promise<void> => {
      const rest: Ast.Node[] = [];
      for (const child of nodes) {
        if (child.type === 'macro' && child.content === 'caption') {
          if (rest.length > 0) parts.push(await this.flow(rest.splice(0)));
          const words = WORDS[this.language];
          parts.push(`<p><em>${kind === 'figure' ? words.figure : words.table} ${number}. ${await this.inline(lastRequiredArg(child))}</em></p>`);
          continue;
        }
        if (child.type === 'macro' && child.content === 'label') {
          this.registerLabel(child);
          continue;
        }
        rest.push(child);
      }
      if (rest.length > 0) parts.push(await this.flow(rest));
    };
    await visit(node.content);
    return parts.filter(Boolean).join('\n');
  }

  private async theorem(node: Ast.Environment, theorem: Theorem): Promise<string> {
    const number = theorem.counter ? this.nextCount(`theorem:${theorem.counter}`) : '';
    if (number) {
      this.pendingLabelTarget = number;
    }
    // The parser does not know the signature of a theorem the document declares,
    // so its [title] stays at the start of the content.
    const declared = node.args?.find(arg => arg.openMark === '[' && arg.content.length > 0)?.content;
    const { optional, rest } = declared ? { optional: declared, rest: node.content } : takeLeadingOptional(node.content);
    const heading = `<strong>${escapeHtml(theorem.label)}${number ? ` ${number}` : ''}${optional ? ` (${await this.inline(optional)})` : ''}.</strong> `;
    const body = await this.flow(rest);
    return body.startsWith('<p>') ? `<p>${heading}${body.slice(3)}` : `<p>${heading}</p>\n${body}`;
  }

  private async image(path: string): Promise<string> {
    if (this.resolver) {
      for (const directory of this.graphicsPaths) {
        const base = joinPath(directory, path);
        const candidates = IMAGE_EXTENSIONS.some(extension => base.toLowerCase().endsWith(`.${extension}`))
          ? [base]
          : IMAGE_EXTENSIONS.map(extension => `${base}.${extension}`);
        for (const candidate of candidates) {
          const dataUrl = await readImageDataUrl(candidate, this.resolver);
          if (dataUrl) {
            return `<img src="${dataUrl}" alt="${escapeHtml(path.split('/').pop() || path)}" />`;
          }
        }
      }
    }
    // A PDF or EPS figure, or one that is not at hand: the reader still learns something was there.
    return `[${escapeHtml(WORDS[this.language].image)}: ${escapeHtml(path)}]`;
  }

  /** The LaTeX of a formula exactly as written, with its delimiters removed. */
  private mathSource(node: Ast.InlineMath | Ast.DisplayMath): string {
    const raw = sourceOf(this.source, node) ?? printRaw(node);
    const inner = raw.startsWith('$$') ? raw.slice(2, -2) : raw.startsWith('$') ? raw.slice(1, -1) : raw.slice(2, -2);
    return this.stripLabels(inner).trim();
  }

  private displayEnvironment(name: string, body: string): string {
    const base = name.replace(/\*$/, '');
    const numbered = !name.endsWith('*') && base !== 'displaymath' && base !== 'math';
    const inner = MATH_ENVIRONMENTS[base] ?? null;

    if (inner === null) {
      const tag = numbered ? this.equationTag(body) : '';
      return `\\[${this.stripLabels(body).trim()}${tag}\\]`;
    }

    // Numbers go at the end of each line: \tag is not allowed inside aligned.
    const lines = splitMathLines(body).map(line => {
      const tag = numbered && !/\\no(?:number|tag)\b/.test(line) && line.trim() ? `\\qquad\\text{(${this.equationNumber(line)})}` : '';
      return `${this.stripLabels(line).replace(/\\no(?:number|tag)\b/g, '').trim()}${tag}`;
    });
    if (base === 'eqnarray') {
      return `\\[\\begin{array}{rcl}${lines.join(' \\\\ ')}\\end{array}\\]`;
    }
    const columns = base === 'alignat' ? `{${(/^\s*\{(\d+)\}/.exec(body)?.[1]) ?? '1'}}` : '';
    const content = base === 'alignat' ? lines.join(' \\\\ ').replace(/^\s*\{\d+\}/, '') : lines.join(' \\\\ ');
    return `\\[\\begin{${inner}}${columns}${content}\\end{${inner}}\\]`;
  }

  private equationTag(body: string): string {
    return `\\tag{${this.equationNumber(body)}}`;
  }

  private equationNumber(body: string): string {
    const number = this.nextCount('equation');
    for (const match of body.matchAll(/\\label\s*\{([^}]*)\}/g)) {
      this.labels.set(match[1].trim(), number);
    }
    return number;
  }

  private stripLabels(math: string): string {
    return math.replace(/\\label\s*\{[^}]*\}/g, '');
  }

  private nextCount(counter: string): string {
    const next = (this.counters.get(counter) ?? 0) + 1;
    this.counters.set(counter, next);
    return String(next);
  }

  private registerLabel(node: Ast.Macro): void {
    const key = printRaw(lastRequiredArg(node)).trim();
    if (key && this.pendingLabelTarget !== null) {
      this.labels.set(key, this.pendingLabelTarget);
    }
  }

  private flushFootnotes(): string {
    if (this.footnotes.length === 0) {
      return '';
    }
    const notes = this.footnotes.splice(0).join('\n');
    return `${notes}\n`;
  }
}

function piecesToHtml(pieces: Piece[]): string {
  let html = '';
  let text = '';
  const flushText = () => {
    html += escapeHtml(applyLigatures(text));
    text = '';
  };
  for (const piece of pieces) {
    if (piece.kind === 'text') {
      text += piece.value;
    } else if (piece.kind === 'html' || piece.kind === 'block') {
      flushText();
      html += piece.value;
    }
  }
  flushText();
  return html.replace(/[ \t\n]+/g, ' ');
}

// TeX builds these from plain keyboard characters; formulas are left untouched.
function applyLigatures(text: string): string {
  return text
    .split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/)
    .map((part, index) => index % 2 === 1 ? part : part
      .replace(/---/g, '—')
      .replace(/--/g, '–')
      .replace(/``/g, '“')
      .replace(/''/g, '”')
      .replace(/`/g, '‘')
      .replace(/'/g, '’')
      .replace(/!`/g, '¡')
      .replace(/\?`/g, '¿')
      .replace(/<</g, '«')
      .replace(/>>/g, '»')
      .replace(/~/g, ' '))
    .join('');
}

/** Braced arguments following a command the parser did not attach them to, past any beamer overlay <2->. */
function gatherArguments(nodes: Ast.Node[], start: number, count: number): { args: Ast.Argument[]; next: number } {
  let index = start;
  if (nodes[index]?.type === 'string' && (nodes[index] as Ast.String).content.startsWith('<')) {
    while (index < nodes.length && !(nodes[index].type === 'string' && (nodes[index] as Ast.String).content.includes('>'))) index += 1;
    index += 1;
  }
  const args: Ast.Argument[] = [];
  while (args.length < count) {
    let probe = index;
    while (nodes[probe]?.type === 'whitespace') probe += 1;
    const node = nodes[probe];
    if (node?.type !== 'group') break;
    args.push({ type: 'argument', openMark: '{', closeMark: '}', content: node.content });
    index = probe + 1;
  }
  return { args, next: index };
}

function takeLeadingGroup(nodes: Ast.Node[]): { group: Ast.Node[] | null; rest: Ast.Node[] } {
  let start = 0;
  while (nodes[start]?.type === 'whitespace' || nodes[start]?.type === 'parbreak') start += 1;
  const first = nodes[start];
  return first?.type === 'group' ? { group: first.content, rest: nodes.slice(start + 1) } : { group: null, rest: nodes };
}

function takeLeadingOptional(nodes: Ast.Node[]): { optional: Ast.Node[] | null; rest: Ast.Node[] } {
  let start = 0;
  while (nodes[start]?.type === 'whitespace' || nodes[start]?.type === 'parbreak') start += 1;
  const first = nodes[start];
  if (first?.type !== 'string' || !first.content.startsWith('[')) {
    return { optional: null, rest: nodes };
  }
  const optional: Ast.Node[] = [];
  for (let index = start; index < nodes.length; index += 1) {
    const node = nodes[index];
    const text = node.type === 'string' ? (index === start ? node.content.slice(1) : node.content) : null;
    const close = text?.indexOf(']') ?? -1;
    if (text !== null && close >= 0) {
      if (close > 0) optional.push({ type: 'string', content: text.slice(0, close) });
      const after = text.slice(close + 1);
      return { optional, rest: [...(after ? [{ type: 'string', content: after } as Ast.String] : []), ...nodes.slice(index + 1)] };
    }
    optional.push(text !== null ? { type: 'string', content: text } : node);
  }
  return { optional: null, rest: nodes };
}

function splitMathLines(body: string): string[] {
  const lines: string[] = [];
  let depth = 0;
  let current = '';
  for (let index = 0; index < body.length; index += 1) {
    const rest = body.slice(index);
    if (rest.startsWith('\\begin{')) depth += 1;
    if (rest.startsWith('\\end{')) depth -= 1;
    if (body[index] === '{') depth += 1;
    if (body[index] === '}') depth -= 1;
    if (depth === 0 && rest.startsWith('\\\\')) {
      lines.push(current);
      current = '';
      index += 1;
      continue;
    }
    if (body[index] === '\\' && index + 1 < body.length) {
      current += body.slice(index, index + 2);
      index += 1;
      continue;
    }
    current += body[index];
  }
  lines.push(current);
  return lines.filter((line, index) => line.trim() || index < lines.length - 1);
}

function detectLanguage(source: string): Language {
  const babel = /\\usepackage\s*\[([^\]]*)\]\s*\{babel\}/.exec(source)?.[1] ?? '';
  const polyglossia = /\\setdefaultlanguage\s*(?:\[[^\]]*\])?\s*\{([^}]*)\}/.exec(source)?.[1] ?? '';
  // babel takes the last language as the main one.
  const main = (polyglossia || babel.split(',').map(part => part.trim()).filter(Boolean).pop() || '').toLowerCase();
  if (main.startsWith('spanish') || main === 'es') return 'es';
  if (main.startsWith('catalan') || main === 'ca' || main === 'valencian') return 'ca';
  return 'en';
}

function sourceOf(source: string, node: Ast.Node): string | null {
  const position = node.position;
  return position ? source.slice(position.start.offset, position.end.offset) : null;
}

function innerSource(source: string, node: Ast.Environment | Ast.Node): string {
  const raw = sourceOf(source, node) ?? printRaw(node);
  return raw.replace(/^\\begin\s*\{[^}]*\}/, '').replace(/\\end\s*\{[^}]*\}\s*$/, '');
}

function envName(node: Ast.Environment | Ast.Node): string {
  const env = (node as { env?: unknown }).env;
  return typeof env === 'string' ? env : printRaw(env as Ast.Node[]);
}

function requiredArgs(node: Ast.Macro): Ast.Node[][] {
  return (node.args ?? []).filter(arg => arg.openMark === '{').map(arg => arg.content);
}

function lastRequiredArg(node: Ast.Macro): Ast.Node[] {
  const args = requiredArgs(node);
  return args[args.length - 1] ?? [];
}

function lastArgContent(node: Ast.Macro): Ast.Node[] {
  const args = node.args ?? [];
  return args[args.length - 1]?.content ?? [];
}

function findMacro(nodes: Ast.Node[], name: string): Ast.Macro | null {
  for (const node of nodes) {
    if (node.type === 'macro' && node.content === name) return node;
    if (node.type === 'environment' && envName(node) === 'document') break;
  }
  return null;
}

function findEnvironment(nodes: Ast.Node[], name: string): Ast.Environment | null {
  for (const node of nodes) {
    if (node.type === 'environment' && envName(node) === name) return node;
  }
  return null;
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function stemOf(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').trim();
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
