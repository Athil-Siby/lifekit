import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { whatsappLink } from '../lib/misc2';
import { Card } from '../components/ui/Card';
import { CopyButton } from '../components/ui/CopyButton';
import { Input } from '../components/ui/Form';

export default function WhatsappLink() {
  const [phone, setPhone] = useState('+91 98765 43210');
  const [msg, setMsg] = useState('Hi! I saw your post and I’m interested.');
  const [qr, setQr] = useState('');
  const digits = phone.replace(/\D/g, '');
  const valid = digits.length >= 8 && digits.length <= 15;
  const link = valid ? whatsappLink(phone, msg) : '';
  useEffect(() => {
    if (!link) { setQr(''); return; }
    let c = false;
    import('qrcode').then((Q) => Q.toDataURL(link, { width: 360, margin: 1 })).then((u) => !c && setQr(u));
    return () => { c = true; };
  }, [link]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <Input label="WhatsApp number with country code" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={phone && !valid ? 'Include the country code, e.g. +91 for India or +971 for the UAE.' : null} />
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-fg">Pre-filled message (optional)</span>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} maxLength={1000} className="w-full rounded-xl border border-line bg-surface-2 p-3 text-fg focus:border-accent focus:outline-none" /></label>
        <p className="text-xs text-fg-subtle">Anyone who taps the link opens a WhatsApp chat with you, with the message ready to send. Great for Instagram bios, shops and business cards.</p>
      </Card>
      <Card className="h-fit space-y-4 p-5">
        {link ? (
          <>
            <code className="block break-all rounded-xl bg-surface-2 p-3 text-sm text-fg">{link}</code>
            <div className="flex flex-wrap gap-2"><CopyButton text={link} variant="primary" label="Copy link" /><a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-sm font-medium text-fg hover:bg-surface-2"><ExternalLink className="h-4 w-4" aria-hidden /> Test it</a></div>
            {qr && <div className="flex flex-col items-center gap-2"><img src={qr} alt="QR code for the WhatsApp link" className="h-48 w-48 rounded-xl bg-white p-2" /><a href={qr} download="whatsapp-qr.png" className="text-sm font-medium text-accent-text">Download QR code</a></div>}
          </>
        ) : <p className="text-sm text-fg-subtle">Enter a phone number to create your link.</p>}
      </Card>
    </div>
  );
}
