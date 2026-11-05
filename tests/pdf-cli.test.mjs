// PDF → .elpx in the CLI runs EdiMarkdown's converter in Node (ADR 0008).
// The fixtures are EdiMarkdown's synthetic test PDFs (test/fixtures there).
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { unzipSync, strFromU8 } from 'fflate';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const cli = resolve(root, 'dist/cli/cli/execonvert.js');
const fixture = name => resolve(root, 'tests/fixtures/pdf', name);
const call = args => run(process.execPath, [cli, '--no-update-check', '--lang', 'en', ...args], { cwd: root, timeout: 240000 });

async function convert(t, input, args = []) {
  const dir = await mkdtemp(join(tmpdir(), 'execonvert-pdf-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = join(dir, 'out.elpx');
  const result = await call([input, output, ...args]);
  const files = unzipSync(new Uint8Array(await readFile(output)));
  const content = strFromU8(files['content.xml']).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return { ...result, files, content, pages: [...content.matchAll(/<pageName>([^<]*)<\/pageName>/g)].map(match => match[1]) };
}

test('a PDF becomes a project: pages, tables, images, notes, no repeated headers', { timeout: 240000 }, async t => {
  const { content, pages, files } = await convert(t, fixture('pdf-import.pdf'));
  assert.ok(pages.includes('Section 1') && pages.includes('Notas al pie'), pages.join(' | '));
  assert.ok(!content.includes('REPEATED HEADER'));
  assert.match(content, /<table/);
  assert.ok(Object.keys(files).some(name => /^content\/resources\/.+\/imagen-1\.jpg$/.test(name)));
  // The footnote call hangs from its word, and its note follows in the section.
  assert.match(content, /aula<sup>\d<\/sup> se mide/);
  assert.match(content, /<sup>\d<\/sup> Medida tomada en el curso anterior\./);
});

test('PDF options: pages, headers kept, images left out', { timeout: 240000 }, async t => {
  const { content, pages, files } = await convert(t, fixture('pdf-import.pdf'), ['--pages', '1-2', '--keep-headers', '--no-images']);
  assert.ok(pages.includes('Section 2') && !pages.includes('Section 3'), pages.join(' | '));
  assert.ok(content.includes('REPEATED HEADER'));
  assert.ok(!Object.keys(files).some(name => name.startsWith('content/resources/')));
});

test('scanned pages without OCR are reported', { timeout: 240000 }, async t => {
  const { stderr } = await convert(t, fixture('pdf-ocr.pdf'));
  assert.match(stderr, /--ocr/);
});

test('an invalid page range is a clear error', { timeout: 240000 }, async () => {
  const error = await call([fixture('pdf-import.pdf'), join(tmpdir(), 'never.elpx'), '--pages', '50-60']).then(() => null, failure => failure);
  assert.ok(error);
  assert.match(error.stderr, /--pages 1-3,5/);
});

// Downloads the language data from jsDelivr the first time: opt-in.
test('OCR reads the scanned pages', { timeout: 240000, skip: !process.env.EXECONVERT_TEST_OCR }, async t => {
  const { content } = await convert(t, fixture('pdf-ocr.pdf'), ['--ocr', '--ocr-lang', 'spa']);
  assert.match(content, /DOCUMENTO ESCANEADO/);
  assert.match(content, /Portada del informe anual/);
});

test('the runtime patch is still the one pdf-worker.js applies', async () => {
  const worker = await readFile(resolve(root, 'app/public/pdf/pdf-worker.js'), 'utf8');
  const source = await readFile(resolve(root, 'cli/pdf-node.ts'), 'utf8');
  for (const [file, line] of [
    ['helpers/utils.py', 'from pymupdf4llm.ocr.analyze_page import analyze_page'],
    ['__init__.py', 'from .batch_converter import convert_batch'],
  ]) {
    assert.ok(worker.includes(`('${file}', '${line}')`), `${file} in pdf-worker.js`);
    assert.ok(source.includes(`['${file}', '${line}']`), `${file} in pdf-node.ts`);
  }
  for (const wheel of ['pymupdf-1.28.2-cp313-abi3-pyemscripten_2025_0_wasm32.whl', 'pymupdf4llm-1.28.2-py3-none-any.whl', 'tabulate-0.9.0-py3-none-any.whl']) {
    assert.ok(worker.includes(wheel) && source.includes(wheel), wheel);
  }
});
