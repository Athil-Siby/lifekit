import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/** Each tool's interface is code-split so visitors only download the tool they open. */
export const toolComponents: Record<string, LazyExoticComponent<ComponentType>> = {
  'pdf-merger': lazy(() => import('./PdfMerger')),
  'pdf-splitter': lazy(() => import('./PdfSplitter')),
  'pdf-compressor': lazy(() => import('./PdfCompressor')),
  'image-compressor': lazy(() => import('./ImageCompressor')),
  'image-converter': lazy(() => import('./ImageConverter')),
  'qr-code-generator': lazy(() => import('./QrCodeGenerator')),
  'password-generator': lazy(() => import('./PasswordGenerator')),
  'unit-converter': lazy(() => import('./UnitConverter')),
  'word-counter': lazy(() => import('./WordCounter')),
  'percentage-calculator': lazy(() => import('./PercentageCalculator')),
  'age-calculator': lazy(() => import('./AgeCalculator')),
  'time-zone-converter': lazy(() => import('./TimeZoneConverter')),
  'text-formatter': lazy(() => import('./TextFormatter')),
  'file-size-calculator': lazy(() => import('./FileSizeCalculator')),
};
