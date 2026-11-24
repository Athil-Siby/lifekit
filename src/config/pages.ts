/**
 * SEO metadata for static pages. Kept import-free so the build script can read it.
 */
export interface PageMeta {
  path: string;
  title: string;
  description: string;
}

export const staticPages: PageMeta[] = [
  {
    path: '/',
    title: 'LifeKit – 90 Free Everyday Tools: PDF, Image, Student & Money',
    description:
      'Free online tools that run in your browser: PDF to Word, compress photos to 20KB, sign PDFs, CGPA and attendance calculators, resume builder, timers and more.',
  },
  {
    path: '/tools',
    title: 'All Tools – LifeKit',
    description:
      'Browse all 90 free LifeKit tools: PDF and documents, images, calculators, student tools, timers, text, fun and developer tools. Search or filter by category.',
  },
  {
    path: '/guides',
    title: 'Guides – Practical How-Tos | LifeKit',
    description:
      'Short, practical guides for everyday digital tasks: shrinking PDFs for email, choosing image formats, Wi-Fi QR codes, strong passwords and more.',
  },
  {
    path: '/about',
    title: 'About – LifeKit',
    description: 'Why LifeKit exists, how it works and what we commit to: useful tools, privacy by design and no account required.',
  },
  {
    path: '/contact',
    title: 'Contact – LifeKit',
    description: 'Send feedback, report a problem or suggest a new tool for LifeKit.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy – LifeKit',
    description: 'How LifeKit handles information, files, cookies, advertising and your privacy rights.',
  },
  {
    path: '/terms',
    title: 'Terms of Service – LifeKit',
    description: 'The terms that apply when you use LifeKit’s free online tools.',
  },
  {
    path: '/cookies',
    title: 'Cookie Policy – LifeKit',
    description: 'What cookies and local storage LifeKit uses today, and how consent works if analytics or advertising are added.',
  },
];
