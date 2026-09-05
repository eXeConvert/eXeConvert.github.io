// The CLI runs on linkedom, which does not resolve namespaces in XML documents:
// looking formulas up by namespace found nothing and every OMML formula was
// silently dropped from .docx conversions. Synthetic fixture, no external files.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { zipSync, unzipSync } from 'fflate';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const enc = s => new TextEncoder().encode(s);

// a/b as an inline formula, written the way Word writes it.
const omml = `<m:oMath><m:f><m:num><m:r><m:t>a</m:t></m:r></m:num>`
  + `<m:den><m:r><m:t>b</m:t></m:r></m:den></m:f></m:oMath>`;
const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Fórmulas</w:t></w:r></w:p>
    <w:p><w:r><w:t>Fracción: </w:t></w:r>${omml}</w:p>
  </w:body>
</w:document>`;
const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

test('a .docx formula survives the conversion to .elpx', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'execonvert-omml-'));
  try {
    const docx = join(dir, 'formula.docx');
    await writeFile(docx, zipSync({
      '[Content_Types].xml': enc(contentTypes),
      '_rels/.rels': enc(rels),
      'word/document.xml': enc(documentXml),
    }));

    await run(process.execPath, [resolve(root, 'dist/cli/cli/execonvert.js'), docx, '--to', 'elpx'],
      { cwd: dir, timeout: 120000 });

    const elpx = unzipSync(new Uint8Array(await readFile(join(dir, 'formula.elpx'))));
    const content = new TextDecoder().decode(elpx['content.xml']);
    assert.ok(content.includes('\\frac{a}{b}'), 'the formula should reach content.xml as LaTeX');
    assert.ok(!content.includes('\\(?\\)'), 'no formula should convert to "?"');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
