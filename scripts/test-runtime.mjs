// Synthetic fixture: no personal teaching materials or external services needed.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import { promisify } from 'node:util';
import { unzipSync, zipSync, strToU8, strFromU8 } from 'fflate';
import puppeteer from 'puppeteer';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const work = await mkdtemp(join(tmpdir(), 'execonvert-runtime-test-'));
const cli = join(root, 'bin/execonvert.js');
const call = async (...args) => {
  const result = await run(process.execPath, [cli, ...args], {
    cwd: root, env: { ...process.env, EXECONVERT_NO_UPDATE_CHECK: '1' }, timeout: 90000, maxBuffer: 10 * 1024 * 1024,
  });
  return result.stdout;
};
let server;
let browser;
try {
  const fixture = zipSync({
    'contentv3.xml': new Uint8Array(await readFile(join(root, 'tests/fixtures/legacy-contentv3.xml'))),
    'circle.svg': strToU8('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="blue"/></svg>'),
  });
  const input = join(work, 'legacy.elp');
  const elpx = join(work, 'legacy.elpx');
  await writeFile(input, fixture);
  await call(input, elpx);
  const project = unzipSync(new Uint8Array(await readFile(elpx)));
  const content = strFromU8(project['content.xml']);
  assert.match(content, /Marcador de compatibilidad/);
  assert.match(content, /\\frac\{1\}\{2\}/);
  assert.match(content, /\\sqrt\{4\}/);
  assert.ok(Object.keys(project).some(name => name.endsWith('.svg') && strFromU8(project[name]).includes('<circle')));
  const i18n = Object.keys(project).find(name => name.endsWith('common_i18n.js'));
  assert.ok(i18n, 'export includes translations');
  assert.match(strFromU8(project[i18n]), /Siguiente/);
  const inspection = JSON.parse(await call('inspect', elpx, '--json'));
  assert.deepEqual(inspection.pages.map(page => page.title), ['Inicio', 'Segunda página']);
  for (const format of ['md', 'docx', 'pdf']) await call(elpx, join(work, `result.${format}`));
  const md = await readFile(join(work, 'result.md'), 'utf8');
  assert.match(md, /Marcador de compatibilidad/);
  assert.match(md, /Contenido de la segunda página/);
  const docx = unzipSync(new Uint8Array(await readFile(join(work, 'result.docx'))));
  assert.match(strFromU8(docx['word/document.xml']), /Marcador de compatibilidad/);
  assert.equal((await readFile(join(work, 'result.pdf'))).subarray(0, 5).toString(), '%PDF-');
  for (const format of ['md', 'docx']) {
    const output = join(work, `roundtrip-${format}.elpx`);
    await call(join(work, `result.${format}`), output);
    const zip = unzipSync(new Uint8Array(await readFile(output)));
    assert.match(strFromU8(zip['content.xml']), /Marcador de compatibilidad/);
  }
  console.log('CLI: ELP → ELPX → Markdown/DOCX/PDF; Markdown/DOCX → ELPX; páginas, imagen, LaTeX e i18n correctos.');

  const docs = join(root, 'docs');
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const path = resolve(docs, `.${pathname === '/' ? '/index.html' : pathname}`);
      if (!path.startsWith(docs + sep)) { response.writeHead(403).end(); return; }
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
      response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
      response.end(await readFile(path));
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // The application may have external fonts/analytics; this test is local only.
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (/^(data:|blob:|about:)/.test(request.url()) || request.url().startsWith(origin + '/')) void request.continue();
    else void request.abort();
  });
  await page.goto(origin, { waitUntil: 'networkidle0' });
  await (await page.$('#file-input')).uploadFile(input);
  await page.waitForFunction(() => /Preview generated|Vista previa generada|Previsualització generada|Error:/.test(document.querySelector('#status').textContent), { timeout: 60000 });
  const state = await page.evaluate(() => ({
    status: document.querySelector('#status').textContent,
    visible: !document.querySelector('#preview-field').hidden,
    preview: document.querySelector('#preview-frame').srcdoc,
    pages: document.querySelectorAll('#page-selection-list input').length,
  }));
  assert.doesNotMatch(state.status, /Error:/);
  assert.ok(state.visible);
  assert.match(state.preview, /Marcador de compatibilidad/);
  assert.equal(state.pages, 2);
  console.log('Web compilada: conversión ELP y vista previa de las dos páginas correctas.');
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(done => server.close(done));
  await rm(work, { recursive: true, force: true });
}
