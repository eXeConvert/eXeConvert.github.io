import assert from 'node:assert/strict';
import test from 'node:test';
import { placeFootnotes, renderPdfMarkdown } from '../src/pdf-import.ts';

test('cada nota va al final de la sección que la cita', () => {
  const markdown = [
    '# Uno',
    '',
    'Texto con nota [^1].',
    '',
    '## Dos',
    '',
    'Otra nota[^2] y la primera otra vez[^1].',
    '',
    '[^1]: Primera nota.',
    '[^2]: Segunda nota.',
  ].join('\n');
  const result = placeFootnotes(markdown);
  const first = result.indexOf('<sup>1</sup> Primera nota.');
  const second = result.indexOf('<sup>2</sup> Segunda nota.');
  assert.ok(first > result.indexOf('Texto con nota') && first < result.indexOf('## Dos'));
  assert.ok(second > result.indexOf('Otra nota'));
  assert.equal(result.match(/Primera nota/g).length, 1);
  assert.ok(!result.includes('[^'));
});

test('la llamada de un encabezado se quita y su nota se conserva', () => {
  const result = placeFootnotes('# Notas al pie[^1]\n\nTexto.\n\n[^1]: Nota del título.');
  assert.match(result, /^# Notas al pie$/m);
  assert.ok(result.includes('<sup>1</sup> Nota del título.'));
});

test('una definición sin llamada no se escribe, y el código no se toca', () => {
  const result = placeFootnotes('Uso `[^1]` en código.\n\n```\n[^1]\n```\n\n[^1]: Huérfana.');
  assert.ok(!result.includes('Huérfana'));
  assert.ok(result.includes('`[^1]`'));
});

test('las imágenes que llegan aparte pasan a data: en el HTML', () => {
  const html = renderPdfMarkdown({
    markdown: 'Antes\n\n![](pdf/imagen-1.png)\n\nDespués',
    images: [{ relativePath: 'pdf/imagen-1.png', bytes: new Uint8Array([137, 80, 78, 71]) }],
  });
  assert.ok(html.includes('src="data:image/png;base64,iVBORw=="'));
});

test('el HTML que trae el conversor se respeta', () => {
  const html = renderPdfMarkdown({ markdown: '| A | B |\n|---|---|\n| x<br>y | 2<sup>3</sup> |', images: [] });
  assert.ok(html.includes('x<br>y'));
  assert.ok(html.includes('2<sup>3</sup>'));
});

test('el motor copiado de EdiMarkdown coincide con su manifiesto', async () => {
  const { createHash } = await import('node:crypto');
  const { readFile } = await import('node:fs/promises');
  const base = new URL('../app/public/pdf/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('vendor/pdf-runtime/manifest.json', base), 'utf8'));
  assert.ok(manifest.files.length > 0);
  for (const file of manifest.files) {
    const bytes = await readFile(new URL(`vendor/pdf-runtime/${file.name}`, base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.name);
  }
  const source = JSON.parse(await readFile(new URL('source.json', base), 'utf8'));
  const data = JSON.parse(await readFile(new URL('../src/pdf-import-data.json', import.meta.url), 'utf8'));
  assert.deepEqual(data.source, source);
});
