/** Builders that turn form fields into standard QR payload strings. */
export type QrKind = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms';

export interface QrFields {
  url: string;
  text: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: 'WPA' | 'WEP' | 'nopass';
  wifiHidden: boolean;
  email: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsBody: string;
}

export const emptyQrFields: QrFields = {
  url: '',
  text: '',
  wifiSsid: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  wifiHidden: false,
  email: '',
  emailSubject: '',
  emailBody: '',
  phone: '',
  smsBody: '',
};

/** Escape special characters in Wi-Fi QR fields (\ ; , : "). */
export function escapeWifi(value: string): string {
  return value.replace(/([\;,:"])/g, '\\$1');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{3,20}$/;

export function normalizeUrl(input: string): string {
  const v = input.trim();
  if (!v) return v;
  if (/^[a-z][a-z\d+.-]*:/i.test(v)) return v;
  return `https://${v}`;
}

export function isValidUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input));
    return (u.protocol === 'http:' || u.protocol === 'https:') ? /\./.test(u.hostname) || u.hostname === 'localhost' : true;
  } catch {
    return false;
  }
}

export type QrBuild = { ok: true; payload: string } | { ok: false; error: string | null };

/** `error: null` means the form is simply empty (no message needed). */
export function buildQrPayload(kind: QrKind, f: QrFields): QrBuild {
  switch (kind) {
    case 'url': {
      if (!f.url.trim()) return { ok: false, error: null };
      if (!isValidUrl(f.url)) return { ok: false, error: 'Enter a valid web address, for example example.com.' };
      return { ok: true, payload: normalizeUrl(f.url) };
    }
    case 'text':
      if (!f.text) return { ok: false, error: null };
      return { ok: true, payload: f.text };
    case 'wifi': {
      if (!f.wifiSsid) return { ok: false, error: null };
      if (f.wifiSecurity !== 'nopass' && !f.wifiPassword) {
        return { ok: false, error: 'Enter the network password, or choose “No password”.' };
      }
      const pass = f.wifiSecurity === 'nopass' ? '' : `P:${escapeWifi(f.wifiPassword)};`;
      return {
        ok: true,
        payload: `WIFI:T:${f.wifiSecurity};S:${escapeWifi(f.wifiSsid)};${pass}${f.wifiHidden ? 'H:true;' : ''};`,
      };
    }
    case 'email': {
      if (!f.email.trim()) return { ok: false, error: null };
      if (!EMAIL_RE.test(f.email.trim())) return { ok: false, error: 'Enter a valid email address.' };
      const params = new URLSearchParams();
      if (f.emailSubject) params.set('subject', f.emailSubject);
      if (f.emailBody) params.set('body', f.emailBody);
      const q = params.toString().replace(/\+/g, '%20');
      return { ok: true, payload: `mailto:${f.email.trim()}${q ? `?${q}` : ''}` };
    }
    case 'phone': {
      if (!f.phone.trim()) return { ok: false, error: null };
      if (!PHONE_RE.test(f.phone.trim())) return { ok: false, error: 'Enter a valid phone number, for example +44 20 7946 0000.' };
      return { ok: true, payload: `tel:${f.phone.replace(/[\s().-]/g, '')}` };
    }
    case 'sms': {
      if (!f.phone.trim()) return { ok: false, error: null };
      if (!PHONE_RE.test(f.phone.trim())) return { ok: false, error: 'Enter a valid phone number.' };
      const num = f.phone.replace(/[\s().-]/g, '');
      return { ok: true, payload: f.smsBody ? `SMSTO:${num}:${f.smsBody}` : `SMSTO:${num}` };
    }
  }
}

/** WCAG relative-luminance contrast ratio between two hex colours. */
export function contrastRatio(hexA: string, hexB: string): number {
  const lum = (hex: string) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
    const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(hexA);
  const b = lum(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function relativeLuminanceDarker(fg: string, bg: string): boolean {
  const l = (hex: string) => {
    const h = hex.replace('#', '');
    return parseInt(h.slice(0, 2), 16) * 0.299 + parseInt(h.slice(2, 4), 16) * 0.587 + parseInt(h.slice(4, 6), 16) * 0.114;
  };
  return l(fg) < l(bg);
}
