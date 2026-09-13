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
  const webPage = join(work, 'pagina.html');
  await writeFile(webPage, '<!doctype html><html><head><title>Página</title></head><body><main><h1>Inicio</h1><p>Marcador de compatibilidad \\(\\frac{1}{2}\\)</p></main></body></html>');
  for (const format of ['md', 'docx']) {
    const output = join(work, `roundtrip-${format}.elpx`);
    await call(join(work, `result.${format}`), output);
    const zip = unzipSync(new Uint8Array(await readFile(output)));
    assert.match(strFromU8(zip['content.xml']), /Marcador de compatibilidad/);
  }
  await call(webPage, join(work, 'pagina.elpx'));
  const fromHtml = strFromU8(unzipSync(new Uint8Array(await readFile(join(work, 'pagina.elpx'))))['content.xml']);
  assert.match(fromHtml, /Marcador de compatibilidad/);
  assert.match(fromHtml, /\\frac\{1\}\{2\}/);
  const texDocument = join(work, 'apuntes.tex');
  await writeFile(texDocument, '\\documentclass{article}\n\\newcommand{\\R}{\\mathbb{R}}\n\\begin{document}\n\\section{Inicio}\nMarcador de compatibilidad $x \\in \\R$.\n\\end{document}\n');
  await call(texDocument, join(work, 'apuntes.elpx'));
  const fromTex = strFromU8(unzipSync(new Uint8Array(await readFile(join(work, 'apuntes.elpx'))))['content.xml']);
  assert.match(fromTex, /Marcador de compatibilidad/);
  assert.match(fromTex, /\\\(x \\in \\mathbb\{R\}\\\)/);
  console.log('CLI: ELP → ELPX → Markdown/DOCX/PDF; Markdown/DOCX/HTML/LaTeX → ELPX; páginas, imagen, LaTeX e i18n correctos.');

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
  // Same flags the converter uses on Linux: CI runners have no unprivileged
  // user namespaces, and the Chrome zygote aborts without them.
  browser = await puppeteer.launch({
    headless: true,
    args: process.platform === 'linux' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });
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

  const statusSettled = () => page.waitForFunction(
    () => /Preview generated|Vista previa generada|Previsualització generada|Error:/.test(document.querySelector('#status').textContent),
    { timeout: 60000 },
  );
  const previewState = () => page.evaluate(() => ({
    status: document.querySelector('#status').textContent,
    preview: document.querySelector('#preview-frame').srcdoc,
    save: document.querySelector('#submit-button .btn-label').textContent,
  }));

  await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
  await (await page.$('#file-input')).uploadFile(webPage);
  await page.click('#preview-button');
  await statusSettled();
  const imported = await previewState();
  assert.doesNotMatch(imported.status, /Error:/);
  assert.match(imported.preview, /Marcador de compatibilidad/);
  assert.match(imported.save, /\.elpx/);
  const site = join(work, 'sitio.zip');
  await writeFile(site, zipSync({
    'sitio/index.html': strToU8('<html><body><main><h1>Portada web</h1><p><img src="img/circulo.svg" alt="Círculo"></p></main></body></html>'),
    'sitio/img/circulo.svg': strToU8('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><circle cx="4" cy="4" r="3"/></svg>'),
  }));
  await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
  await (await page.$('#file-input')).uploadFile(site);
  await page.waitForFunction(() => !document.querySelector('#structure-field').hidden, { timeout: 60000 });
  await page.click('#preview-button');
  await statusSettled();
  const zipped = await previewState();
  assert.doesNotMatch(zipped.status, /Error:/);
  assert.match(zipped.preview, /Portada web/);
  assert.match(zipped.preview, /data:image\/svg\+xml;base64,/);
  const overleaf = join(work, 'overleaf.zip');
  await writeFile(overleaf, zipSync({
    'main.tex': strToU8('\\documentclass{article}\n\\begin{document}\n\\section{Tema LaTeX}\n\\input{parte}\n\\includegraphics{circulo}\n\\end{document}\n'),
    'parte.tex': strToU8('Texto incluido con $\\frac{a}{b}$.\n'),
    'circulo.svg': strToU8('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><circle cx="4" cy="4" r="3"/></svg>'),
  }));
  await page.evaluate(() => { document.querySelector('#status').textContent = ''; });
  await (await page.$('#file-input')).uploadFile(overleaf);
  await page.waitForFunction(() => !document.querySelector('#structure-field').hidden, { timeout: 60000 });
  await page.click('#preview-button');
  await statusSettled();
  const latex = await previewState();
  assert.doesNotMatch(latex.status, /Error:/);
  assert.match(latex.preview, /Tema LaTeX/);
  assert.match(latex.preview, /Texto incluido/);
  assert.match(latex.preview, /data:image\/svg\+xml;base64,/);
  console.log('Web compilada: importación de HTML, LaTeX y .zip correctas.');
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(done => server.close(done));
  await rm(work, { recursive: true, force: true });
}
