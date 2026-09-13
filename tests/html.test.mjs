// An imported web page has its wrappers, rendered formulas and relative images
// sorted out on the way in. Synthetic fixtures, no external files.
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
  const dir = await mkdtemp(join(tmpdir(), 'execonvert-html-'));
  try {
    await body(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function readProject(path) {
  const content = new TextDecoder().decode(unzipSync(new Uint8Array(await readFile(path)))['content.xml']);
  const pageIds = [...content.matchAll(/<odePageId>([^<]*)<\/odePageId>\s*<odeParentPageId>/g)].map(match => match[1]);
  const pages = [...content.matchAll(/<odeNavStructure>([\s\S]*?)<\/odeNavStructure>/g)].map(([, page]) => ({
    title: /<pageName>([^<]*)/.exec(page)[1],
    parent: pageIds.indexOf(/<odeParentPageId>([^<]*)/.exec(page)[1]),
    blocks: [...page.matchAll(/<blockName>([^<]*)[\s\S]*?<htmlView><!\[CDATA\[([\s\S]*?)\]\]><\/htmlView>/g)]
      .map(([, name, html]) => ({ name, html: html.replace(/\s+/g, ' ').trim() })),
  }));
  return { title: /pp_title<\/key><value>([^<]*)/.exec(content)[1], pages, content };
}

test('a web page keeps its structure, formulas and images', async () => {
  await withDir(async dir => {
    await mkdir(join(dir, 'pagina_files'));
    await writeFile(join(dir, 'pagina_files/foto.png'), PNG);
    await writeFile(join(dir, 'secreto.txt'), 'no debe entrar');
    const page = `<!doctype html><html><head><meta charset="iso-8859-1"><title>Página guardada</title>
<script>var tracking = 1;</script></head><body>
<nav><a href="/">Menú</a></nav>
<div class="wrapper"><main><article>
<h1>Tema único</h1>
<section><h2>Fórmulas</h2>
<p>MathJax 2: <span class="MathJax">basura</span><script type="math/tex">a^2+b^2</script></p>
<p>KaTeX: <span class="katex"><span class="katex-mathml"><math><semantics><mi>x</mi><annotation encoding="application/x-tex">\\sqrt{x}</annotation></semantics></math></span><span class="katex-html">x</span></span></p>
<p>MathML: <math><mfrac><mn>1</mn><mn>2</mn></mfrac></math></p>
<p>MathJax 3: <mjx-container class="MathJax" display="true"><mjx-math>y</mjx-math><mjx-assistive-mml><math><mi>y</mi></math></mjx-assistive-mml></mjx-container></p>
</section>
<section><h2>Imágenes</h2>
<figure><img src="pagina_files/foto.png" alt="Foto"><figcaption>Pie de foto</figcaption></figure>
<p><img src="secreto.txt" alt="Oculto"></p>
</section>
</article></main></div></body></html>`;
    await writeFile(join(dir, 'pagina.html'), Buffer.from(page, 'latin1'));

    await call(['pagina.html', 'pagina.elpx'], dir);
    const project = await readProject(join(dir, 'pagina.elpx'));
    assert.equal(project.title, 'Página guardada');
    assert.deepEqual(project.pages.map(page => page.title), ['Tema único']);
    assert.deepEqual(project.pages[0].blocks.map(block => block.name), ['Fórmulas', 'Imágenes']);

    const [formulas, images] = project.pages[0].blocks.map(block => block.html);
    for (const formula of ['\\(a^2+b^2\\)', '\\(\\sqrt{x}\\)', '\\(\\frac{1}{2}\\)', '\\[y\\]']) {
      assert.ok(formulas.includes(formula), `missing ${formula} in ${formulas}`);
    }
    assert.doesNotMatch(formulas, /basura/, 'rendered MathJax output is dropped');
    assert.doesNotMatch(project.content, /Menú|tracking/);
    assert.ok(images.includes(`data:image/png;base64,${Buffer.from(PNG).toString('base64')}`), 'the local image is embedded');
    assert.match(images, /<p>Pie de foto<\/p>/);
    assert.doesNotMatch(project.content, /no debe entrar|bm8gZGViZSBlbnRyYXI/, 'only images are read from disk');
  });
});

test('a .zip is told apart by what it holds', async () => {
  await withDir(async dir => {
    await writeFile(join(dir, 'web.zip'), zipSync({
      'sitio/index.html': enc('<html><body><h1>Portada</h1><p><img src="img/a.png" alt="A"></p></body></html>'),
      'sitio/img/a.png': PNG,
    }));
    await call(['web.zip', 'web.elpx'], dir);
    const web = await readProject(join(dir, 'web.elpx'));
    assert.deepEqual(web.pages.map(page => page.title), ['Portada']);
    assert.match(web.content, /data:image\/png;base64,/);

    await call(['web.elpx', 'proyecto.zip'], dir).then(
      () => assert.fail('a .zip is not an output format'),
      failure => assert.match(failure.stderr, /\.zip/),
    );
    await writeFile(join(dir, 'proyecto.zip'), await readFile(join(dir, 'web.elpx')));
    const { stdout } = await call(['proyecto.zip', 'proyecto.md', '--json'], dir);
    assert.equal(JSON.parse(stdout).inputFormat, 'elpx');

    await writeFile(join(dir, 'vacio.zip'), zipSync({ 'notas.txt': enc('nada') }));
    await call(['vacio.zip', 'vacio.elpx'], dir).then(
      () => assert.fail('a .zip without a project or a page cannot be converted'),
      failure => assert.match(failure.stderr, /vacio\.zip/),
    );
  });
});

test('$ and $$ formulas become \\( \\) and \\[ \\], prices do not', async () => {
  await withDir(async dir => {
    await writeFile(join(dir, 'dolares.html'), String.raw`<html><body><h1>Fórmulas</h1>
<p>En línea $x^2$ y $\text{\$5}$.</p><p>$$\int_0^1 f$$</p><p>Texto $$a+b$$ en medio.</p>
<p>Precio 5$ y 10$, cuesta $5 y $10. Escapado \$x\$.</p><pre>code $a$</pre></body></html>`);
    await call(['dolares.html', 'dolares.elpx'], dir);
    const html = (await readProject(join(dir, 'dolares.elpx'))).pages[0].blocks[0].html;
    for (const expected of [
      '\\(x^2\\)', '\\(\\text{\\$5}\\)', '\\[\\int_0^1 f\\]', 'Texto \\[a+b\\] en medio',
      'Precio 5$ y 10$, cuesta $5 y $10. Escapado $x$.', 'code $a$',
    ]) {
      assert.ok(html.includes(expected), `missing ${expected} in ${html}`);
    }
  });
});
