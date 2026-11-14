/**
 * Minimal .docx writer: paragraphs with optional size/bold, and page breaks.
 * Produces a valid Office Open XML package that Word, Google Docs, Pages and
 * LibreOffice open. Uses fflate (already a dependency) for the zip container.
 */
export type DocBlock = { type: 'p'; text: string; size?: number; bold?: boolean } | { type: 'pageBreak' };

/** Drop characters that XML 1.0 does not allow (control characters, lone surrogates). */
function xmlSafe(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c === 0x9 || c === 0xa || c === 0xd || (c >= 0x20 && c <= 0xd7ff) || (c >= 0xe000 && c <= 0xfffd) || c >= 0x10000) out += ch;
  }
  return out;
}

const esc = (s: string) =>
  xmlSafe(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function buildDocumentXml(blocks: DocBlock[]): string {
  const body = blocks
    .map((b) => {
      if (b.type === 'pageBreak') return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
      const halfPts = Math.round(Math.min(72, Math.max(8, b.size ?? 11)) * 2);
      const rPr = `<w:rPr>${b.bold ? '<w:b/>' : ''}<w:sz w:val="${halfPts}"/><w:szCs w:val="${halfPts}"/></w:rPr>`;
      return `<w:p><w:pPr><w:spacing w:after="${b.bold ? 120 : 160}" w:line="276" w:lineRule="auto"/></w:pPr><w:r>${rPr}<w:t xml:space="preserve">${esc(b.text)}</w:t></w:r></w:p>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

export async function buildDocx(blocks: DocBlock[]): Promise<Blob> {
  const { zipSync, strToU8 } = await import('fflate');
  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    'word/document.xml': strToU8(buildDocumentXml(blocks)),
  };
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as Uint8Array<ArrayBuffer>], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
