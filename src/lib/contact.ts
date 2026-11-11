import { EMAIL_RE } from './qrContent';

export interface ContactForm {
  name: string;
  email: string;
  topic: 'feedback' | 'bug' | 'idea' | 'privacy' | 'other';
  message: string;
  /** Honeypot field; must stay empty. */
  website: string;
}

export type ContactErrors = Partial<Record<keyof ContactForm, string>>;

export function validateContact(f: ContactForm): ContactErrors {
  const e: ContactErrors = {};
  const name = f.name.trim();
  const email = f.email.trim();
  const message = f.message.trim();
  if (!name) e.name = 'Please enter your name.';
  else if (name.length > 100) e.name = 'Please keep your name under 100 characters.';
  if (!email) e.email = 'Please enter your email address so we can reply.';
  else if (!EMAIL_RE.test(email) || email.length > 200) e.email = 'That email address doesn’t look right.';
  if (!message) e.message = 'Please write a message.';
  else if (message.length < 10) e.message = 'Please write at least 10 characters.';
  else if (message.length > 5000) e.message = 'Please keep your message under 5,000 characters.';
  return e;
}
