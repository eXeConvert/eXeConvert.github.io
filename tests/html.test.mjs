// An imported web page has its wrappers, rendered formulas and relative images
// sorted out on the way in. Synthetic fixtures, no external files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { zipSync, unzipSync, zlibSync } from 'fflate';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const cli = resolve(root, 'dist/cli/cli/execonvert.js');
const call = (args, cwd) => run(process.execPath, [cli, ...args], {
  cwd, timeout: 120000, env: { ...process.env, EXECONVERT_NO_UPDATE_CHECK: '1' },
});
const enc = value => new TextEncoder().encode(value);
const PNG = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

// A real grey PNG of the given size. Its pixels are noise, which does not
// compress, as in a photo: a reduced copy is lighter only if it has fewer pixels.
function makePng(width, height) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = bytes => {
    let c = 0xffffffff;
    for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const u32 = value => [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
  const chunk = (type, data) => {
    const body = [...enc(type), ...data];
    return [...u32(data.length), ...body, ...u32(crc(body))];
  };
  const rows = new Uint8Array((width + 1) * height);
  let seed = 1;
  const random = () => {
    // mulberry32: a plain linear generator repeats and would compress.
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) & 0xff;
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) rows[y * (width + 1) + 1 + x] = random();
  }
  return Uint8Array.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...chunk('IHDR', [...u32(width), ...u32(height), 8, 0, 0, 0, 0]),
    ...chunk('IDAT', [...zlibSync(rows)]),
    ...chunk('IEND', []),
  ]);
}

function pngSize(data) {
  const view = new DataView(data.buffer, data.byteOffset);
  return [view.getUint32(16), view.getUint32(20)];
}

async function withDir(body) {
  const dir = await mkdtemp(join(tmpdir(), 'execonvert-html-'));
  try {
    await body(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function readProject(path) {
  const entries = unzipSync(new Uint8Array(await readFile(path)));
  const content = new TextDecoder().decode(entries['content.xml']);
  const pageIds = [...content.matchAll(/<odePageId>([^<]*)<\/odePageId>\s*<odeParentPageId>/g)].map(match => match[1]);
  const pages = [...content.matchAll(/<odeNavStructure>([\s\S]*?)<\/odeNavStructure>/g)].map(([, page]) => ({
    title: /<pageName>([^<]*)/.exec(page)[1],
    parent: pageIds.indexOf(/<odeParentPageId>([^<]*)/.exec(page)[1]),
    blocks: [...page.matchAll(/<blockName>([^<]*)[\s\S]*?<htmlView><!\[CDATA\[([\s\S]*?)\]\]><\/htmlView>/g)]
      .map(([, name, html]) => ({ name, html: html.replace(/\s+/g, ' ').trim() })),
  }));
  return { title: /pp_title<\/key><value>([^<]*)/.exec(content)[1], pages, content, entries };
}

// Images are kept as eXeLearning keeps them: a file in content/resources and a
// {{context_path}} reference to it.
function imageFiles(project, html = project.content) {
  return [...html.matchAll(/src="\{\{context_path\}\}\/([^"]+)"/g)]
    .map(([, path]) => project.entries[`content/resources/${path}`]);
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
    assert.deepEqual(imageFiles(project, images), [PNG], 'the local image is a file of the project');
    assert.doesNotMatch(project.content, /data:image/);
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
    assert.deepEqual(imageFiles(web), [PNG]);

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

test('a page from a site: its title, light images and only links that lead somewhere', async () => {
  await withDir(async dir => {
    const large = makePng(3000, 40);
    const embedded = `data:image/png;base64,${Buffer.from(PNG).toString('base64')}`;
    await writeFile(join(dir, 'Inicio.zip'), zipSync({
      'Inicio.html': enc(`<html><head><title>Centro de ayuda</title></head><body>
<p>Bienvenida. Ver <a href="Documentacion.html">la documentación</a>, <a href="#h.seccion">una sección</a>,
<a href="#">nada</a> o <a href="https://exelearning.net/">eXeLearning</a>.</p>
<p><img src="Inicio/grande.png" alt="Grande"><img src="${embedded}" alt="Una"><img src="${embedded}" alt="Otra"></p>
<h2 id="h.seccion">Sección</h2><p>Texto.</p></body></html>`),
      'Inicio/grande.png': large,
    }));
    await call(['Inicio.zip', 'Inicio.elpx'], dir);
    const project = await readProject(join(dir, 'Inicio.elpx'));
    assert.equal(project.title, 'Centro de ayuda');
    assert.deepEqual(project.pages.map(page => page.title), ['Centro de ayuda'], 'no «Página 1»');

    const html = project.pages[0].blocks[0].html;
    for (const kept of ['la documentación', 'una sección', 'nada', '<a href="https://exelearning.net/">eXeLearning</a>']) {
      assert.ok(html.includes(kept), `missing ${kept} in ${html}`);
    }
    assert.doesNotMatch(html, /href="(?!https:)/, 'links to pages and anchors outside the project are gone');

    const references = [...html.matchAll(/src="([^"]+)"/g)].map(match => match[1]);
    assert.equal(references[1], references[2], 'the same image twice is one file');
    const [reduced, small] = imageFiles(project, html);
    assert.deepEqual(pngSize(reduced), [1920, 26], 'the large image is cut to 1920 px on its long side');
    assert.ok(reduced.length < large.length);
    assert.deepEqual(small, PNG, 'small images stay as they are');
    assert.equal(Object.keys(project.entries).filter(path => path.startsWith('content/resources/')).length, 2);
    assert.doesNotMatch(project.content, /data:image/);

    const preview = new TextDecoder().decode(project.entries['index.html']);
    assert.match(preview, /src="content\/resources\/[^"]+\/imagen-1\.png"/, 'the package pages find the files');
  });
});

test('a site in a .zip becomes one project, with the pages, nesting and links of its menu', async () => {
  await withDir(async dir => {
    // As in Google Sites: a banner with the menu and the site's name, then the
    // page's title in an <h1>.
    const menu = `<header><nav><ul>
<li><a href="Inicio.html">Inicio</a></li>
<li><div><a href="Unidad.html">Unidad 1</a></div><ul><li><a href="Unidad/Tema.html">Tema A</a></li></ul></li>
<li><a href="Otra.html">Unidad 2</a></li>
<li><a>Más</a><ul><li><a href="Inicio.html">Inicio</a></li><li><a href="Otra.html">Unidad 2</a></li></ul></li>
</ul></nav><a href="Inicio.html">Mi sitio</a></header>`;
    const page = (title, body) => {
      const heading = title.replace(/^Mi sitio - /, '');
      return enc(`<html><head><title>${title}</title></head><body>${menu}<h1>${heading === 'Mi sitio' ? 'Inicio' : heading}</h1>${body}</body></html>`);
    };
    await writeFile(join(dir, 'takeout.zip'), zipSync({
      'Takeout/Drive/Sitio/Inicio.html': page('Mi sitio', '<p>Portada. Ver <a href="Unidad/Tema.html#h.x">el tema</a> y <a href="Extra.html">más</a>.</p><iframe src="marco.html"></iframe>'),
      'Takeout/Drive/Sitio/Unidad.html': page('Mi sitio - Unidad 1', '<p>Unidad. <img src="Unidad/foto.png" alt="Foto"></p>'),
      'Takeout/Drive/Sitio/Unidad/Tema.html': page('Mi sitio - Tema A', '<p>Tema, <a href="../Otra.html">la otra</a>. <img src="foto.png" alt="Foto"></p><h2>Ejercicio</h2><p>Hazlo.</p>'),
      'Takeout/Drive/Sitio/Unidad/foto.png': PNG,
      'Takeout/Drive/Sitio/Otra.html': page('Mi sitio - Unidad 2', '<p>Otra, <a href="Inicio.html">volver</a>.</p>'),
      'Takeout/Drive/Sitio/Extra.html': page('Mi sitio - Extra', '<p>Solo enlazada desde el texto.</p>'),
      'Takeout/Drive/Sitio/marco.html': page('Marco', '<p>Un marco, no una página.</p>'),
    }));
    await call(['takeout.zip', 'sitio.elpx'], dir);
    const project = await readProject(join(dir, 'sitio.elpx'));
    assert.equal(project.title, 'Mi sitio');
    assert.deepEqual(
      project.pages.map(page => [page.title, page.parent]),
      [['Inicio', -1], ['Unidad 1', -1], ['Tema A', 1], ['Unidad 2', -1], ['Extra', -1]],
      'menu order and nesting; the page the menu leaves out, at the end with its <h1>; no frame; no page for the banner or the <h1>',
    );
    const content = project.pages.flatMap(page => page.blocks.map(block => block.html)).join(' ');
    assert.doesNotMatch(content, /<h1>|Mi sitio/, 'neither the page title nor the banner reaches the content');
    assert.deepEqual(project.pages[2].blocks.map(block => block.name), ['Contenido', 'Ejercicio']);

    const ids = [...project.content.matchAll(/<odePageId>([^<]*)<\/odePageId>\s*<odeParentPageId>/g)].map(match => match[1]);
    const linkTo = index => `href="exe-node:${ids[index]}"`;
    const html = project.pages.map(page => page.blocks.map(block => block.html).join(' '));
    assert.ok(html[0].includes(`<a ${linkTo(2)}>el tema</a>`), html[0]);
    assert.ok(html[0].includes(`<a ${linkTo(4)}>más</a>`), html[0]);
    assert.ok(html[2].includes(`<a ${linkTo(3)}>la otra</a>`), html[2]);
    assert.ok(html[3].includes(`<a ${linkTo(0)}>volver</a>`), html[3]);
    assert.doesNotMatch(project.content, /Un marco/);

    const references = [...project.content.matchAll(/src="\{\{context_path\}\}\/([^"]+)"/g)].map(match => match[1]);
    assert.equal(references.length, 2);
    assert.equal(references[0], references[1], 'the photo two pages share is one file');
    assert.deepEqual(imageFiles(project, html[1]), [PNG]);

    const preview = new TextDecoder().decode(project.entries['index.html']);
    assert.match(preview, /<a href="html\/tema-a\.html">el tema<\/a>/, 'the package pages link to each other');
  });
});

test('a documentation site without <nav>: its menu list, its main content and its headings', async () => {
  await withDir(async dir => {
    // As in MkDocs: the menu is a plain list, the content is marked role="main"
    // and a table of contents with links to the page's own sections sits
    // beside it; headings carry a permalink icon.
    const page = (title, body, root = '') => enc(`<html><head><title>${title} - Docs</title></head><body>
<div class="navbar"><ul class="nav"><li><a href="${root}index.html">Home</a></li>
<li class="dropdown"><a href="#">Guía</a><ul><li><a href="${root}guia/instalar.html">Instalar</a></li><li><a href="${root}guia/usar.html">Usar</a></li></ul></li></ul></div>
<div class="sidebar"><ul><li><a href="#uno">Uno</a></li><li><a href="#dos">Dos</a></li></ul></div>
<div role="main">${body}</div><footer>Hecho con Docs</footer></body></html>`);
    await writeFile(join(dir, 'docs.zip'), zipSync({
      'site/index.html': page('Docs', '<h1>Bienvenida a la documentación</h1><p>Lee la <a href="guia/instalar.html">instalación</a>.</p>'),
      'site/guia/instalar.html': page('Instalar', `<h1 id="instalar">Cómo se instala<a class="headerlink" href="instalar.html#instalar">\uf0c1</a></h1>
<p>Primero <a href="instalar.html#uno">esto</a>.</p><h2 id="uno">Requisitos<a class="headerlink" href="#uno">¶</a></h2><p>Ninguno.</p>
<ul><li><a href="usar.html">Usar</a></li></ul>`, '../'),
      'site/guia/usar.html': page('Usar', '<h1>Uso</h1><p>Vuelve al <a href="../index.html">inicio</a>.</p>', '../'),
    }));
    await call(['docs.zip', 'docs.elpx'], dir);
    const project = await readProject(join(dir, 'docs.elpx'));
    assert.deepEqual(project.pages.map(page => [page.title, page.parent]), [['Home', -1], ['Instalar', -1], ['Usar', -1]],
      'the menu names the pages; a label with no page of its own leaves its items at its level; no page for the <h1>');
    assert.equal(project.title, 'Docs - Docs');
    const html = project.pages.map(page => page.blocks.map(block => `${block.name}: ${block.html}`).join(' '));
    assert.deepEqual(project.pages[1].blocks.map(block => block.name), ['Contenido', 'Requisitos'], 'no permalink icon in the titles');
    assert.ok(html[1].includes('Primero esto.'), 'a link to a part of the same page keeps only its text');
    assert.ok(html[1].includes('<a href="exe-node:'), 'a list of links in the content is not taken for the menu');
    assert.doesNotMatch(html.join(' '), /Hecho con Docs|>Uno<|>Dos<|Bienvenida|Guía/, 'no sidebar, footer, menu or page title in the content');
  });
});
