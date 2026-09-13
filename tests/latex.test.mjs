// A .tex document becomes a project with its structure, and its formulas reach
// eXeLearning exactly as written: MathJax reads LaTeX, so nothing is translated.
// Synthetic fixtures, no external files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { zipSync, unzipSync } from 'fflate';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const cli = resolve(root, 'dist/cli/cli/execonvert.js');
const call = (args, cwd) => run(process.execPath, [cli, ...args], {
  cwd, timeout: 120000, env: { ...process.env, EXECONVERT_NO_UPDATE_CHECK: '1' },
});
const enc = value => new TextEncoder().encode(value);
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

async function withDir(body) {
  const dir = await mkdtemp(join(tmpdir(), 'execonvert-latex-'));
  try {
    await body(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function readProject(path) {
  const content = new TextDecoder().decode(unzipSync(new Uint8Array(await readFile(path)))['content.xml']);
  const pages = [...content.matchAll(/<odeNavStructure>([\s\S]*?)<\/odeNavStructure>/g)].map(([, page]) => ({
    title: /<pageName>([^<]*)/.exec(page)[1],
    blocks: [...page.matchAll(/<blockName>([^<]*)[\s\S]*?<htmlView><!\[CDATA\[([\s\S]*?)\]\]><\/htmlView>/g)]
      .map(([, name, html]) => ({ name, html: html.replace(/\s+/g, ' ').trim() })),
  }));
  const html = pages.flatMap(page => page.blocks.map(block => block.html)).join('\n');
  return { title: /pp_title<\/key><value>([^<]*)/.exec(content)[1], pages, html };
}

const DOCUMENT = String.raw`\documentclass{article}
\usepackage[spanish]{babel}
\usepackage{amsmath,graphicx}
\graphicspath{{img/}}
\newcommand{\R}{\mathbb{R}}
\newcommand{\norm}[1]{\left\lVert #1 \right\rVert}
\newtheorem{teorema}{Teorema}
\title{Apuntes de \emph{Cálculo}}
\begin{document}
\maketitle
\section{Funciones}\label{sec:funciones}
Sea $f\colon \R \to \R$ con $\norm{x}$. % un comentario
Véase la ecuación~\eqref{eq:euler} y la sección~\ref{sec:derivadas}.
Acentos: canci\'on, ni\~no; ` + "``comillas''" + String.raw` --- raya; 50\,\% y 10\$\footnote{Nota.}.

\begin{equation}\label{eq:euler}
e^{i\pi} + 1 = 0
\end{equation}

\subsection{Listas}
\begin{itemize}
  \item Uno con $x^2$
  \item Dos
\end{itemize}
\begin{tabular}{|l|c|}
\hline A & B \\ \hline 1 & $\alpha$ \\
\end{tabular}

\input{capitulo}

\begin{figure}
\includegraphics[width=5cm]{grafica}
\caption{Una gráfica}
\end{figure}
\includegraphics{secreto.txt}
\begin{verbatim}
codigo % literal
\end{verbatim}
\raro{texto propio}
\end{document}
`;

const CHAPTER = String.raw`\section{Derivadas}\label{sec:derivadas}
\begin{teorema}[Continuidad]
Si $f$ es derivable, es continua.
\end{teorema}
`;

test('a LaTeX document keeps its structure and its formulas as written', async () => {
  await withDir(async dir => {
    await mkdir(join(dir, 'img'));
    await writeFile(join(dir, 'img/grafica.png'), PNG);
    await writeFile(join(dir, 'secreto.txt'), 'no debe entrar');
    await writeFile(join(dir, 'apuntes.tex'), DOCUMENT);
    await writeFile(join(dir, 'capitulo.tex'), CHAPTER);

    const { stdout } = await call(['apuntes.tex', 'apuntes.elpx', '--json'], dir);
    const report = JSON.parse(stdout);
    assert.equal(report.inputFormat, 'latex');
    assert.deepEqual(report.unrecognized, ['\\raro']);

    const project = await readProject(join(dir, 'apuntes.elpx'));
    assert.equal(project.title, 'Apuntes de Cálculo');
    assert.deepEqual(project.pages.map(page => page.title), ['Funciones', 'Derivadas']);
    assert.deepEqual(project.pages[0].blocks.map(block => block.name), ['Contenido', 'Listas']);

    const { html } = project;
    for (const expected of [
      '\\(f\\colon \\mathbb{R} \\to \\mathbb{R}\\)',
      '\\(\\left\\lVert x \\right\\rVert\\)',
      '\\[e^{i\\pi} + 1 = 0\\tag{1}\\]',
      'la ecuación (1) y la sección 2',
      'canción, niño; “comillas” — raya; 50 % y 10$<sup>1</sup>',
      '<p><sup>1</sup> Nota.</p>',
      '<li>Uno con \\(x^2\\)</li>',
      '<td>1</td><td>\\(\\alpha\\)</td>',
      '<strong>Teorema 1 (Continuidad).</strong> Si \\(f\\) es derivable',
      `data:image/png;base64,${Buffer.from(PNG).toString('base64')}`,
      '<em>Figura 1. Una gráfica</em>',
      '<pre><code>codigo % literal',
      'texto propio',
    ]) {
      assert.ok(html.includes(expected), `missing ${expected}`);
    }
    assert.doesNotMatch(html, /un comentario/);
    assert.doesNotMatch(html, /no debe entrar|bm8gZGViZSBlbnRyYXI/, 'only images are embedded');
  });
});

test('a LaTeX project in a .zip is found and read with its pieces', async () => {
  await withDir(async dir => {
    await writeFile(join(dir, 'overleaf.zip'), zipSync({
      'proyecto/capitulo.tex': enc(CHAPTER),
      'proyecto/main.tex': enc(DOCUMENT),
      'proyecto/img/grafica.png': PNG,
    }));
    const { stdout } = await call(['overleaf.zip', 'overleaf.elpx', '--json'], dir);
    assert.equal(JSON.parse(stdout).inputFormat, 'latex');
    const project = await readProject(join(dir, 'overleaf.elpx'));
    assert.deepEqual(project.pages.map(page => page.title), ['Funciones', 'Derivadas']);
    assert.match(project.html, /data:image\/png;base64,/);
  });
});

test('beamer slides become iDevices under their section', async () => {
  await withDir(async dir => {
    await writeFile(join(dir, 'clase.tex'), String.raw`\documentclass{beamer}
\usetheme{Madrid}
\title{Clase}
\begin{document}
\frame{\titlepage}
\section{Introducción}
\begin{frame}{Primera}
\begin{itemize}
\item<1-> Punto \alert{clave}
\end{itemize}
\end{frame}
\begin{frame}
\frametitle{Segunda}
\begin{block}{Idea}
$E=mc^2$
\end{block}
\begin{columns}
\column{0.5\textwidth} Izquierda
\end{columns}
\end{frame}
\end{document}
`);
    const { stdout } = await call(['clase.tex', 'clase.elpx', '--json'], dir);
    assert.deepEqual(JSON.parse(stdout).unrecognized, []);
    const project = await readProject(join(dir, 'clase.elpx'));
    assert.deepEqual(project.pages.map(page => page.title), ['Introducción']);
    assert.deepEqual(project.pages[0].blocks.map(block => block.name), ['Primera', 'Segunda']);
    assert.match(project.html, /Punto <strong>clave<\/strong>/);
    assert.match(project.html, /<p><strong>Idea<\/strong><\/p> <p>\\\(E=mc\^2\\\)<\/p>/);
    assert.doesNotMatch(project.html, /textwidth|0\.5/);
  });
});

test('a latin1 document is read with its accents', async () => {
  await withDir(async dir => {
    const source = '\\documentclass{article}\n\\usepackage[latin1]{inputenc}\n\\begin{document}\n\\section{Canción}\nAñadir ñandú.\n\\end{document}\n';
    await writeFile(join(dir, 'latin.tex'), Buffer.from(source, 'latin1'));
    await call(['latin.tex', 'latin.elpx'], dir);
    const project = await readProject(join(dir, 'latin.elpx'));
    assert.deepEqual(project.pages.map(page => page.title), ['Canción']);
    assert.match(project.html, /Añadir ñandú/);
  });
});

test('$ and $$ formulas become \\( \\) and \\[ \\]', async () => {
  await withDir(async dir => {
    await writeFile(join(dir, 'dolares.tex'), String.raw`\documentclass{article}
\begin{document}
\section{Fórmulas}
En línea $x^2$ y en bloque $$\int_0^1 f$$ y precio 5\$.
\end{document}
`);
    await call(['dolares.tex', 'dolares.elpx'], dir);
    const { html } = await readProject(join(dir, 'dolares.elpx'));
    assert.ok(html.includes('En línea \\(x^2\\) y en bloque \\[\\int_0^1 f\\] y precio 5$.'), html);
  });
});
