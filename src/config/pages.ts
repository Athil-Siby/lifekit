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
    title: 'LifeKit – Free Everyday Tools, All in One Place',
    description:
      'LifeKit is a free collection of fast, private everyday tools: merge and split PDFs, compress images, generate QR codes and passwords, convert units and more.',
  },
  {
    path: '/tools',
    title: 'All Tools – LifeKit',
    description:
      'Browse every free LifeKit tool: PDF, image, generator, calculator, text and file utilities. Search by name or filter by category.',
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
