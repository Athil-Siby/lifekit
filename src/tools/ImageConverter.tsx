import { useEffect, useState } from 'react';
import { Download, Repeat, RotateCcw } from 'lucide-react';
import { useImageFile } from '../hooks/useImageFile';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { encodeImage, FORMAT_INFO, outputFilename, type EncodeResult, type OutputFormat } from '../lib/image';
import { IMAGE_ACCEPT } from '../utils/files';
import { downloadBlob } from '../utils/download';
import { limits } from '../config/limits';
import { formatBytes } from '../utils/format';
import { Card } from '../components/ui/Card';
import { Dropzone } from '../components/ui/Dropzone';
import { Button } from '../components/ui/Button';
import { Label, Range } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';
import { FileChip } from '../components/FileChip';
import { PageLoader } from '../components/PageLoader';
import { useToast } from '../components/ui/Toast';

const formats: OutputFormat[] = ['image/jpeg', 'image/png', 'image/webp'];

export default function ImageConverter() {
  const toast = useToast();
  const { file, image, loading, select, clear } = useImageFile(IMAGE_ACCEPT);
  const [format, setFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState('#ffffff');
  const [result, setResult] = useState<EncodeResult | null>(null);
  const [working, setWorking] = useState(false);

  const originalUrl = useObjectUrl(file);
  const resultUrl = useObjectUrl(result?.blob);

  // Suggest a sensible target: PNG for JPGs, JPG for everything else.
  useEffect(() => {
    setResult(null);
    if (file) setFormat(file.type === 'image/jpeg' ? 'image/png' : 'image/jpeg');
  }, [file]);

  useEffect(() => setResult(null), [format, quality, background]);

  const convert = async () => {
    if (!image) return;
    setWorking(true);
    try {
      const r = await encodeImage(image, { format, quality: quality / 100, background });
      setResult(r);
      if (r.actualFormat !== format) toast.error(`Your browser can’t create ${FORMAT_INFO[format].label} files.`);
      else toast.success(`Converted to ${FORMAT_INFO[format].label}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Conversion failed.');
    } finally {
      setWorking(false);
    }
  };

  if (!file) {
    return (
      <Card className="p-4 sm:p-6">
        {loading ? (
          <PageLoader label="Opening image…" />
        ) : (
          <Dropzone
            onFiles={select}
            accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif"
            title="Drop an image to convert"
            hint={`JPG, PNG, WebP, GIF, BMP or AVIF · up to ${formatBytes(limits.imageMaxFileBytes)}`}
            icon={<Repeat className="h-7 w-7" aria-hidden />}
          />
        )}
      </Card>
    );
  }

  const fellBack = result && result.actualFormat !== format;
  const outName = outputFilename(file.name, format);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit space-y-5 p-5">
        <FileChip file={file} kind="image" meta={image ? `${image.width} × ${image.height}` : undefined} onRemove={clear} />
        <div>
          <p className="mb-1.5 text-sm font-medium text-fg">Convert to</p>
          <Segmented label="Output format" value={format} onChange={setFormat} options={formats.map((f) => ({ value: f, label: FORMAT_INFO[f].label }))} />
        </div>
        {FORMAT_INFO[format].lossy && <Range label="Quality" min={50} max={100} value={quality} onChange={setQuality} display={`${quality}%`} />}
        {!FORMAT_INFO[format].alpha && (
          <div>
            <Label htmlFor="conv-bg">Background for transparent areas</Label>
            <div className="flex items-center gap-3">
              <input id="conv-bg" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line bg-surface" />
              <span className="font-mono text-sm uppercase text-fg-muted">{background}</span>
            </div>
          </div>
        )}
        {file.type === 'image/gif' && <p className="text-xs text-fg-subtle">Animated GIFs: only the first frame is converted.</p>}
        <Button size="lg" className="w-full" onClick={convert} loading={working} disabled={!image} icon={<Repeat className="h-4 w-4" aria-hidden />}>
          Convert to {FORMAT_INFO[format].label}
        </Button>
        <Button variant="ghost" onClick={clear} icon={<RotateCcw className="h-4 w-4" aria-hidden />} className="w-full">
          Choose another image
        </Button>
      </Card>

      <div className="space-y-4">
        {fellBack && (
          <Notice tone="error" title="Format not supported by this browser">
            The result was saved as {result!.actualFormat.replace('image/', '').toUpperCase()} instead. Try a recent version of Chrome, Edge, Firefox or Safari.
          </Notice>
        )}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm">
            <span className="font-medium text-fg">{result ? `Converted · ${FORMAT_INFO[format].label}` : 'Original'}</span>
            <span className="text-xs text-fg-subtle">{result ? formatBytes(result.blob.size) : formatBytes(file.size)}</span>
          </div>
          <div className="checkerboard flex max-h-[520px] min-h-[260px] items-center justify-center overflow-auto">
            {(result ? resultUrl : originalUrl) && (
              <img src={(result ? resultUrl : originalUrl)!} alt={result ? `Converted ${outName}` : `Original ${file.name}`} className="max-h-[520px] w-auto max-w-full object-contain" />
            )}
          </div>
        </Card>
        {result && !fellBack && (
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => downloadBlob(result.blob, outName)} icon={<Download className="h-4 w-4" aria-hidden />}>
              Download {FORMAT_INFO[format].label}
            </Button>
            <span className="text-sm text-fg-subtle break-all">
              {outName} · {formatBytes(result.blob.size)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
