/** File-size limits. Processing happens in the browser, so these protect the user's device memory. */
const MB = 1024 * 1024;

export const limits = {
  pdfMaxFileBytes: 150 * MB,
  pdfMergeMaxTotalBytes: 400 * MB,
  pdfMergeMaxFiles: 50,
  imageMaxFileBytes: 40 * MB,
  /** Largest edge (in pixels) we will decode into a canvas. Very large canvases fail on mobile devices. */
  imageMaxPixels: 50_000_000,
} as const;
