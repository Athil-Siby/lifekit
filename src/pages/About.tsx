import { Link } from 'react-router-dom';
import { Accessibility, Gauge, Heart, ShieldCheck } from 'lucide-react';
import { useSeo } from '../hooks/useSeo';
import { staticPages } from '../config/pages';
import { tools } from '../config/tools';
import { PageHeader } from '../components/PageHeader';
import { buttonClasses } from '../components/ui/Button';

const principles = [
  { icon: ShieldCheck, title: 'Private by design', text: 'Tools run in your browser, so your files and text are processed on your device instead of being uploaded.' },
  { icon: Gauge, title: 'Fast and focused', text: 'Each tool does one job well. Pages load quickly and get out of your way.' },
  { icon: Heart, title: 'Honest results', text: 'If a PDF can’t be compressed further, we say so. We never fake progress or pretend a tool worked.' },
  { icon: Accessibility, title: 'For everyone', text: 'Keyboard friendly, screen-reader labelled, readable in light and dark mode, and usable on any screen size.' },
];

export default function About() {
  const meta = staticPages.find((p) => p.path === '/about')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  return (
    <>
      <PageHeader eyebrow="About LifeKit" title="Useful tools, without the catch">
        <p>
          LifeKit is a collection of {tools.length} everyday utilities, from PDF merging to time-zone conversion, built to
          be quick, trustworthy and pleasant to use.
        </p>
      </PageHeader>
      <div className="container-page py-14">
        <div className="prose-lk max-w-3xl">
          <h2>Why LifeKit exists</h2>
          <p>
            Small tasks like combining two PDFs, shrinking a photo for an email or checking what time a meeting starts
            in another city should take seconds. Too often they mean pop-ups, sign-up walls, watermarks, daily limits,
            or uploading private documents to a server you know nothing about.
          </p>
          <p>
            LifeKit takes a different approach. Modern browsers are powerful enough to do this work themselves, so our
            tools run on your device. That makes them faster, keeps your data private, and means there is nothing to
            sign up for.
          </p>
          <h2>Our mission</h2>
          <p>
            To be the place people bookmark for everyday digital chores: a calm, reliable toolkit that respects their
            time and their privacy.
          </p>
          <h2>Our commitments</h2>
        </div>
        <div className="mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-6">
              <Icon className="h-6 w-6 text-accent-text" aria-hidden />
              <h3 className="mt-3 font-semibold text-fg">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{text}</p>
            </div>
          ))}
        </div>
        <div className="prose-lk mt-4 max-w-3xl">
          <h2>How LifeKit is funded</h2>
          <p>
            LifeKit is free to use. To cover hosting and development we may introduce clearly labelled advertising in
            the future, and possibly optional extras. Core tools will stay free, and ads will never be placed inside a
            tool’s controls where they could be clicked by accident.
          </p>
          <h2>Get in touch</h2>
          <p>
            Found a bug, or have an idea for a tool that would make your day easier? We would love to hear from you.
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link to="/contact" className={buttonClasses('primary')}>Contact us</Link>
          <Link to="/tools" className={buttonClasses('outline')}>Browse tools</Link>
        </div>
      </div>
    </>
  );
}
