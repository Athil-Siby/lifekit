/**
 * Copies the OCR engine (tesseract.js worker, WebAssembly core and English language data)
 * into public/ocr so the Image to Text tool loads everything from this site, not a CDN.
 * Runs automatically before `dev` and `build`.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const out = join(process.cwd(), 'public', 'ocr');
mkdirSync(out, { recursive: true });

const tess = dirname(require.resolve('tesseract.js/package.json'));
const core = dirname(require.resolve('tesseract.js-core/package.json'));
const eng = dirname(require.resolve('@tesseract.js-data/eng/package.json'));

const files = [
  [join(tess, 'dist', 'worker.min.js'), 'worker.min.js'],
  ...['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'].map((f) => [join(core, f), f]),
  [join(eng, '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
];
for (const [from, name] of files) {
  if (!existsSync(from)) throw new Error(`OCR asset missing: ${from}`);
  copyFileSync(from, join(out, name));
}
console.log(`✓ Copied ${files.length} OCR files to public/ocr`);
