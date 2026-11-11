import { useDeferredValue, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Link2, Mail, MessageSquare, Phone, QrCode, Type, Wifi } from 'lucide-react';
import { buildQrPayload, contrastRatio, emptyQrFields, relativeLuminanceDarker, type QrFields, type QrKind } from '../lib/qrContent';
import { downloadBlob, downloadText } from '../utils/download';
import { consumeHashParams, readParam } from '../lib/hashParams';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Checkbox, Input, Label, Range, Select, Textarea } from '../components/ui/Form';
import { Segmented } from '../components/ui/Segmented';
import { Notice } from '../components/ui/Notice';
import { EmptyState } from '../components/ui/Misc';
import { useToast } from '../components/ui/Toast';

type Ecc = 'L' | 'M' | 'Q' | 'H';

const kinds: { value: QrKind; label: React.ReactNode }[] = [
  { value: 'url', label: <><Link2 className="h-4 w-4" aria-hidden />URL</> },
  { value: 'text', label: <><Type className="h-4 w-4" aria-hidden />Text</> },
  { value: 'wifi', label: <><Wifi className="h-4 w-4" aria-hidden />Wi-Fi</> },
  { value: 'email', label: <><Mail className="h-4 w-4" aria-hidden />Email</> },
  { value: 'phone', label: <><Phone className="h-4 w-4" aria-hidden />Phone</> },
  { value: 'sms', label: <><MessageSquare className="h-4 w-4" aria-hidden />SMS</> },
];

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = `qr-${label.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-2">
        <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border border-line bg-transparent" />
        <input
          aria-label={`${label} hex value`}
          value={value}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase());
          }}
          className="w-full bg-transparent font-mono text-sm uppercase text-fg focus:outline-none"
          maxLength={7}
        />
      </div>
    </div>
  );
}

export default function QrCodeGenerator() {
  const toast = useToast();
  // Optional prefill from the browser extension: #url=… or #text=…
  const [initial] = useState(() => {
    const p = consumeHashParams();
    const url = readParam(p, 'url');
    const text = readParam(p, 'text');
    if (url) return { kind: 'url' as QrKind, fields: { ...emptyQrFields, url: url.slice(0, 2000) } };
    if (text) return { kind: 'text' as QrKind, fields: { ...emptyQrFields, text: text.slice(0, 2000) } };
    return { kind: 'url' as QrKind, fields: emptyQrFields };
  });
  const [kind, setKind] = useState<QrKind>(initial.kind);
  const [fields, setFields] = useState<QrFields>(initial.fields);
  const [fg, setFg] = useState('#0f172a');
  const [bg, setBg] = useState('#ffffff');
  const [size, setSize] = useState(512);
  const [margin, setMargin] = useState(2);
  const [ecc, setEcc] = useState<Ecc>('M');
  const [svg, setSvg] = useState('');
  const [genError, setGenError] = useState<string | null>(null);

  const build = buildQrPayload(kind, fields);
  const payload = useDeferredValue(build.ok ? build.payload : '');
  const set = <K extends keyof QrFields>(k: K, v: QrFields[K]) => setFields((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;
    if (!payload) {
      setSvg('');
      setGenError(null);
      return;
    }
    QRCode.toString(payload, { type: 'svg', errorCorrectionLevel: ecc, margin, color: { dark: fg, light: bg } })
      .then((s) => {
        if (!cancelled) {
          setSvg(s);
          setGenError(null);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setSvg('');
        const msg = e instanceof Error ? e.message : '';
        setGenError(/too big|amount of data/i.test(msg) ? 'That is too much content for a QR code. Shorten it, or lower the error-correction level.' : 'This content could not be turned into a QR code.');
      });
    return () => {
      cancelled = true;
    };
  }, [payload, ecc, margin, fg, bg]);

  const ratio = contrastRatio(fg, bg);
  const inverted = !relativeLuminanceDarker(fg, bg);
  const fileBase = `qr-code-${kind}`;

  const downloadPng = async () => {
    try {
      const url = await QRCode.toDataURL(payload, { errorCorrectionLevel: ecc, margin, width: size, color: { dark: fg, light: bg } });
      const blob = await (await fetch(url)).blob();
      downloadBlob(blob, `${fileBase}.png`);
      toast.success('PNG downloaded');
    } catch {
      toast.error('Could not create the PNG file.');
    }
  };

  const downloadSvg = () => {
    downloadText(svg, `${fileBase}.svg`, 'image/svg+xml');
    toast.success('SVG downloaded');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <Segmented label="QR code content type" options={kinds} value={kind} onChange={setKind} />
          <div className="mt-5 space-y-4">
            {kind === 'url' && (
              <Input label="Website address" type="url" inputMode="url" placeholder="https://example.com" value={fields.url} onChange={(e) => set('url', e.target.value)} error={build.ok ? null : build.error} hint="https:// is added automatically if you leave it out." autoFocus />
            )}
            {kind === 'text' && (
              <Textarea label="Text" placeholder="Any text, up to a few hundred characters works best." value={fields.text} onChange={(e) => set('text', e.target.value)} hint={`${fields.text.length} characters`} maxLength={2000} />
            )}
            {kind === 'wifi' && (
              <>
                <Input label="Network name (SSID)" value={fields.wifiSsid} onChange={(e) => set('wifiSsid', e.target.value)} autoComplete="off" />
                <Select label="Security" value={fields.wifiSecurity} onChange={(e) => set('wifiSecurity', e.target.value as QrFields['wifiSecurity'])}>
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP (older networks)</option>
                  <option value="nopass">No password</option>
                </Select>
                {fields.wifiSecurity !== 'nopass' && (
                  <Input label="Password" type="text" value={fields.wifiPassword} onChange={(e) => set('wifiPassword', e.target.value)} autoComplete="off" error={build.ok ? null : build.error} />
                )}
                <Checkbox checked={fields.wifiHidden} onChange={(v) => set('wifiHidden', v)} label="Hidden network" />
              </>
            )}
            {kind === 'email' && (
              <>
                <Input label="Email address" type="email" value={fields.email} onChange={(e) => set('email', e.target.value)} error={build.ok ? null : build.error} />
                <Input label="Subject (optional)" value={fields.emailSubject} onChange={(e) => set('emailSubject', e.target.value)} />
                <Textarea label="Message (optional)" value={fields.emailBody} onChange={(e) => set('emailBody', e.target.value)} className="min-h-24" />
              </>
            )}
            {(kind === 'phone' || kind === 'sms') && (
              <Input label="Phone number" type="tel" placeholder="+44 20 7946 0000" value={fields.phone} onChange={(e) => set('phone', e.target.value)} error={build.ok ? null : build.error} hint="Include the country code so it works internationally." />
            )}
            {kind === 'sms' && <Textarea label="Message (optional)" value={fields.smsBody} onChange={(e) => set('smsBody', e.target.value)} className="min-h-24" />}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-fg">Appearance</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Foreground" value={fg} onChange={setFg} />
            <ColorField label="Background" value={bg} onChange={setBg} />
            <Range label="PNG size" min={128} max={2048} step={64} value={size} onChange={setSize} display={`${size} × ${size} px`} />
            <Range label="Quiet zone (margin)" min={0} max={8} value={margin} onChange={setMargin} display={`${margin} modules`} />
            <Select label="Error correction" value={ecc} onChange={(e) => setEcc(e.target.value as Ecc)} containerClassName="sm:col-span-2">
              <option value="L">Low (7%) – smallest code</option>
              <option value="M">Medium (15%) – recommended</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%) – most robust</option>
            </Select>
          </div>
          {ratio < 3 && (
            <Notice tone="warning" className="mt-4" title="Low contrast">
              The colours are too similar ({ratio.toFixed(1)}:1). Many phones won’t scan this. Aim for a dark foreground on a light background.
            </Notice>
          )}
          {ratio >= 3 && inverted && (
            <Notice tone="info" className="mt-4">
              Light-on-dark QR codes don’t scan with some older apps. Test it before printing.
            </Notice>
          )}
          {margin < 2 && <p className="mt-3 text-xs text-fg-subtle">Tip: a margin of at least 2 modules helps scanners find the code.</p>}
        </Card>
      </div>

      <div className="lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-fg">Preview</h2>
          {svg ? (
            <div className="checkerboard overflow-hidden rounded-xl">
              <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt="QR code preview" className="block aspect-square w-full" />
            </div>
          ) : genError ? (
            <Notice tone="error">{genError}</Notice>
          ) : (
            <EmptyState icon={<QrCode className="h-6 w-6" />} title="Your QR code will appear here">
              Fill in the form to generate it.
            </EmptyState>
          )}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button onClick={downloadPng} disabled={!svg} icon={<Download className="h-4 w-4" aria-hidden />}>PNG</Button>
            <Button variant="outline" onClick={downloadSvg} disabled={!svg} icon={<Download className="h-4 w-4" aria-hidden />}>SVG</Button>
          </div>
          {svg && <p className="mt-3 text-center text-xs text-fg-subtle">Always test a printed code with a couple of phones.</p>}
        </Card>
      </div>
    </div>
  );
}
