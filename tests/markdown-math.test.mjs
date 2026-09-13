// markdown-it reads \( \) \[ \] as escaped punctuation and drops the backslash,
// so formulas written with those delimiters used to reach the .elpx as plain
// text. Every LaTeX delimiter has to come out as \(...\) or \[...\].
import test from 'node:test';
import assert from 'node:assert/strict';

const { renderMarkdownForTests } = await import('../src/markdown-import.ts');

test('dollar delimiters become \\( \\) and \\[ \\]', () => {
  assert.match(renderMarkdownForTests('Inline $x^2$.'), /\\\(x\^2\\\)/);
  assert.match(renderMarkdownForTests('$$\\frac{a}{b}$$'), /\\\[\\frac\{a\}\{b\}\\\]/);
});

test('inline \\( \\) formulas are kept', () => {
  assert.match(renderMarkdownForTests('Con \\(y^2\\) aquí.'), /\\\(y\^2\\\)/);
  assert.match(renderMarkdownForTests('- Lista con \\(\\alpha\\)'), /\\\(\\alpha\\\)/);
});

test('\\[ \\] formulas are kept as a block, on several lines or inside a paragraph', () => {
  assert.match(renderMarkdownForTests('\\[\\frac{a}{b} = \\sqrt{c}\\]'), /\\\[\\frac\{a\}\{b\} = \\sqrt\{c\}\\\]/);
  assert.match(renderMarkdownForTests('\\[\n\\int_0^1 x\\,dx\n\\]'), /\\\[\\int_0\^1 x\\,dx\\\]/);
  assert.match(renderMarkdownForTests('Texto con \\[z = 1\\] en medio.'), /\\\[z = 1\\\]/);
});

test('display math inside a paragraph keeps the text that follows it', () => {
  for (const source of ['Texto con \\[z = 1\\] en medio.', 'Texto con $$z = 1$$ en medio.']) {
    const html = renderMarkdownForTests(source);
    assert.doesNotMatch(html, /<section>/, source);
    assert.match(html, /^<p>Texto con .*\\\[z = 1\\\].* en medio\.<\/p>/, source);
  }
});

test('loose dollar signs are not taken as formulas', () => {
  assert.equal(renderMarkdownForTests('Precio 5$ y 10$.'), '<p>Precio 5$ y 10$.</p>\n');
});
