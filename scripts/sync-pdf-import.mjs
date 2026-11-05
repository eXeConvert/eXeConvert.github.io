#!/usr/bin/env node
/*
  Trae de EdiMarkdown el importador de PDF que usa la web (ADR 0007).

  Copia tal cual, sin tocar una línea, el diálogo (`pdf-import.js`), el worker
  (`pdf-worker.js`), el guion de Python (`pdf-import.py`), la aduana del
  Markdown (`markup-safety.js`) y el motor (`vendor/pdf-runtime/`: Pyodide con
  PyMuPDF), y saca de sus traducciones las claves `pdf_*`. Comprueba cada
  archivo del motor contra el SHA-256 de su manifiesto y deja anotado de qué
  versión y de qué commit sale todo en `app/public/pdf/source.json` y, con los
  textos, en `src/pdf-import-data.json`.

  Uso:
    node scripts/sync-pdf-import.mjs                 # rama main de GitHub
    node scripts/sync-pdf-import.mjs --ref v3.5.4    # una etiqueta o un commit
    node scripts/sync-pdf-import.mjs --from ../../edimarkdown.github.io
*/
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/edimarkdown/edimarkdown.github.io.git';
const FILES = ['pdf-import.js', 'pdf-worker.js', 'pdf-import.py', 'markup-safety.js'];
const LOCALES = ['es', 'ca', 'en', 'gl', 'eu'];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'app/public/pdf');
const dataTarget = join(root, 'src/pdf-import-data.json');

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1];
}

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

let source = option('--from');
let temporary = null;
if (!source) {
  temporary = await mkdtemp(join(tmpdir(), 'edimarkdown-'));
  const ref = option('--ref') || 'main';
  execFileSync('git', ['clone', '--quiet', '--filter=blob:none', REPO_URL, temporary], { stdio: 'inherit' });
  git(temporary, 'checkout', '--quiet', ref);
  source = temporary;
}
source = resolve(source);

try {
  const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  const commit = git(source, 'rev-parse', 'HEAD');
  const dirty = git(source, 'status', '--porcelain', '--', ...FILES, 'vendor/pdf-runtime', 'locales');
  if (dirty) throw new Error(`EdiMarkdown tiene cambios sin confirmar en las piezas que se copian:\n${dirty}`);

  await rm(target, { recursive: true, force: true });
  await mkdir(join(target, 'vendor'), { recursive: true });
  for (const file of FILES) await cp(join(source, file), join(target, file));
  await cp(join(source, 'vendor/pdf-runtime'), join(target, 'vendor/pdf-runtime'), { recursive: true });

  // Cada pieza del motor, contra la huella que fija su manifiesto.
  const manifest = JSON.parse(await readFile(join(target, 'vendor/pdf-runtime/manifest.json'), 'utf8'));
  const assets = manifest.assets || manifest.files || manifest;
  let checked = 0;
  for (const asset of Object.values(assets)) {
    if (!asset || typeof asset !== 'object' || !asset.sha256) continue;
    const name = asset.file || asset.name || asset.path;
    const bytes = await readFile(join(target, 'vendor/pdf-runtime', name));
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (digest !== asset.sha256) throw new Error(`Huella distinta en ${name}`);
    checked += 1;
  }
  if (!checked) throw new Error('El manifiesto del motor no trae ninguna huella que comprobar.');
  // La versión de terminal carga el motor en Node (ADR 0008). eXeConvert es
  // un paquete de módulos ES, y Pyodide se carga como CommonJS: sin esta
  // marca, Node lee pyodide.asm.js como módulo y falla en su `require`. El
  // navegador no la mira, y no es ninguna de las piezas del manifiesto.
  await writeFile(join(target, 'vendor/pdf-runtime/package.json'), '{\n  "type": "commonjs"\n}\n');

  const locales = {};
  for (const locale of LOCALES) {
    const all = JSON.parse(await readFile(join(source, 'locales', `${locale}.json`), 'utf8'));
    locales[locale] = Object.fromEntries(Object.entries(all).filter(([key]) => key.startsWith('pdf_')));
  }
  const record = { repository: REPO_URL.replace(/\.git$/, ''), version: pkg.version, commit };
  await writeFile(join(target, 'source.json'), `${JSON.stringify(record, null, 2)}\n`);
  // Lo que necesita el código de la web: la versión, para no servir un
  // diálogo viejo de la caché, y los textos del diálogo.
  await writeFile(dataTarget, `${JSON.stringify({ source: record, locales }, null, 2)}\n`);
  const count = (await readdir(join(target, 'vendor/pdf-runtime'))).length;
  console.log(`Importador de PDF de EdiMarkdown ${pkg.version} (${commit.slice(0, 7)}): ${FILES.length} archivos, motor con ${count} piezas (${checked} comprobadas).`);
  // Vite registra los archivos de app/public/ al arrancar: uno nuevo no lo
  // sirve (devuelve index.html) hasta que se reinicia.
  console.log('Si «npm run dev» estaba en marcha, reinícialo para que sirva los archivos nuevos.');
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
