import { useState, type FormEvent } from 'react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { staticPages } from '../config/pages';
import { siteConfig } from '../config/site';
import { PageHeader } from '../components/PageHeader';
import { Input, Select, Textarea } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { Notice } from '../components/ui/Notice';
import { useToast } from '../components/ui/Toast';
import { validateContact, type ContactErrors, type ContactForm } from '../lib/contact';

const empty: ContactForm = { name: '', email: '', topic: 'feedback', message: '', website: '' };

export default function Contact() {
  const meta = staticPages.find((p) => p.path === '/contact')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  const toast = useToast();
  const [form, setForm] = useState<ContactForm>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const configured = Boolean(siteConfig.contactEndpoint);

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields.');
      const first = Object.keys(errs)[0];
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    if (form.website) {
      // Honeypot filled: silently drop likely spam without sending.
      setStatus('sent');
      return;
    }
    if (!configured) return;
    setStatus('sending');
    try {
      const res = await fetch(siteConfig.contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), topic: form.topic, message: form.message.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      setForm(empty);
      toast.success('Message sent. Thank you!');
    } catch {
      setStatus('error');
      toast.error('Your message could not be sent. Please try again later.');
    }
  };

  return (
    <>
      <PageHeader eyebrow="Contact" title="Get in touch">
        <p>Questions, bug reports and tool ideas are all welcome. We read every message.</p>
      </PageHeader>
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div className="max-w-2xl">
          {status === 'sent' ? (
            <div className="flex flex-col items-center rounded-2xl border border-line bg-surface p-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
              <h2 className="mt-4 text-xl font-semibold text-fg">Thanks for your message</h2>
              <p className="mt-2 text-fg-muted">We have received it and will reply to the email address you gave if a response is needed.</p>
              <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5 rounded-2xl border border-line bg-surface p-6 sm:p-8">
              {!configured && (
                <Notice tone="warning" title="The contact form is not connected yet">
                  Messages can’t be sent from this form until a delivery service is configured.
                  {siteConfig.contactEmail ? (
                    <> In the meantime, please email <a className="font-medium text-accent-text underline" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</>
                  ) : (
                    ' Please check back soon.'
                  )}
                </Notice>
              )}
              {status === 'error' && (
                <Notice tone="error" title="Message not sent">
                  Something went wrong while sending. Your text is still here, so you can try again in a moment.
                </Notice>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <Input id="contact-name" label="Your name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} maxLength={100} required />
                <Input id="contact-email" label="Email address" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} maxLength={200} required />
              </div>
              <Select id="contact-topic" label="Topic" value={form.topic} onChange={(e) => set('topic', e.target.value as ContactForm['topic'])}>
                <option value="feedback">General feedback</option>
                <option value="bug">Report a problem</option>
                <option value="idea">Suggest a tool</option>
                <option value="privacy">Privacy question</option>
                <option value="other">Something else</option>
              </Select>
              <Textarea
                id="contact-message"
                label="Message"
                rows={6}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                error={errors.message}
                hint={`${form.message.trim().length}/5000 characters. Please don’t include passwords or sensitive personal information.`}
                maxLength={5000}
                required
              />
              {/* Honeypot: hidden from people, often filled in by bots. */}
              <div className="hidden" aria-hidden>
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
              </div>
              <Button type="submit" size="lg" loading={status === 'sending'} disabled={!configured} icon={<Send className="h-4 w-4" aria-hidden />}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-line bg-surface-2 p-6">
            <h2 className="font-semibold text-fg">Before you write</h2>
            <ul className="mt-3 space-y-2 text-sm text-fg-muted">
              <li>• For a bug, tell us the tool, your browser and what you expected to happen.</li>
              <li>• Please don’t attach or paste private documents. We never need your files to help.</li>
              <li>• Each tool page has an FAQ that may answer your question straight away.</li>
            </ul>
          </div>
          {siteConfig.contactEmail && (
            <div className="rounded-2xl border border-line bg-surface p-6">
              <Mail className="h-5 w-5 text-accent-text" aria-hidden />
              <h2 className="mt-2 font-semibold text-fg">Prefer email?</h2>
              <a href={`mailto:${siteConfig.contactEmail}`} className="mt-1 block break-all text-sm text-accent-text underline">{siteConfig.contactEmail}</a>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
