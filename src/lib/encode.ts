/** UTF-8 safe Base64 and URL encoding helpers. */
export function textToBase64(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const b64 = btoa(bin);
  return urlSafe ? b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b64;
}

export function base64ToText(b64: string): string {
  let s = b64.trim().replace(/^data:[^,]*,/, '').replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error('This isn’t valid Base64.');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Decoded data isn’t readable text (it may be an image or other binary file).');
  }
}

export function urlEncode(text: string, component = true): string {
  return component ? encodeURIComponent(text) : encodeURI(text);
}
export function urlDecode(text: string): string {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    throw new Error('This text contains an invalid % escape sequence.');
  }
}

/** Pretty-print or minify JSON, with a friendly line/column for errors. */
export function formatJson(src: string, indent: number | 'min'): string {
  try {
    const value = JSON.parse(src);
    return indent === 'min' ? JSON.stringify(value) : JSON.stringify(value, null, indent);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const pos = msg.match(/position (\d+)/)?.[1];
    if (pos !== undefined) {
      const before = src.slice(0, Number(pos));
      const line = before.split('\n').length;
      const col = Number(pos) - before.lastIndexOf('\n');
      throw new Error(`Invalid JSON at line ${line}, column ${col}: ${msg.replace(/ in JSON at position \d+.*$/, '').replace(/\s*\(line \d+ column \d+\)/, '')}`);
    }
    const tok = msg.match(/Unexpected token '(.)'/)?.[1];
    if (tok) {
      const at = src.indexOf(tok, src.search(/\S/) + 1);
      if (at >= 0) {
        const before = src.slice(0, at);
        throw new Error(`Invalid JSON at line ${before.split('\n').length}, column ${at - before.lastIndexOf('\n')}: unexpected “${tok}”`);
      }
    }
    throw new Error(`Invalid JSON: ${msg.replace(/, ".*" is not valid JSON$/, '')}`);
  }
}
