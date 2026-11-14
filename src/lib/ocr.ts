/** Image → text with tesseract.js. The engine and language data are served from /ocr on this site. */
export type OcrProgress = (status: string, progress: number) => void;

export async function recognizeImage(image: Blob, onProgress?: OcrProgress): Promise<{ text: string; confidence: number }> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', 1, {
    workerPath: '/ocr/worker.min.js',
    corePath: '/ocr/',
    langPath: '/ocr',
    gzip: true,
    logger: (m: { status: string; progress: number }) => onProgress?.(m.status, m.progress),
  });
  try {
    const { data } = await worker.recognize(image);
    return { text: data.text.replace(/\n{3,}/g, '\n\n').trim(), confidence: data.confidence };
  } finally {
    await worker.terminate();
  }
}
