// temml renders a prime as a superscript over an empty base, so a MathML round
// trip turned f^{'} into f^{^{'}}, nesting one level deeper on every pass.
// Collapsing it must not touch a genuine double superscript, which has a base.
import test from 'node:test';
import assert from 'node:assert/strict';

const { normalizeLatexForTests } = await import('../src/docx-import.ts');

test('a nested empty-base prime collapses back to a single prime', () => {
  assert.equal(normalizeLatexForTests("f^{^{'}}"), "f^{'}");
  assert.equal(normalizeLatexForTests("f^{^{′}}"), "f^{′}");
  assert.equal(normalizeLatexForTests("f^{^{″}}"), "f^{″}");
  assert.equal(normalizeLatexForTests("g^{^{'}}(x) + h^{^{'}}(y)"), "g^{'}(x) + h^{'}(y)");
});

test('genuine superscripts are left untouched', () => {
  for (const formula of [
    'x^{2}',
    "f^{'}",
    'e^{i \\pi}',
    'x^{a^{b}}',           // doble superíndice real: la base interna es "a"
    'x^{^{a}}',            // base vacía pero no es una prima: no se toca
    '2^{2^{2^{2}}}',
    'a^{2} + b^{2} = c^{2}',
  ]) {
    assert.equal(normalizeLatexForTests(formula), formula, `should not change: ${formula}`);
  }
});
