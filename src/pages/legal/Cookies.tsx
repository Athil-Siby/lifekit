import { Link } from 'react-router-dom';
import { useSeo } from '../../hooks/useSeo';
import { staticPages } from '../../config/pages';
import { adsConfig } from '../../config/ads';
import { useConsent } from '../../hooks/useConsent';
import { Button } from '../../components/ui/Button';
import { LegalLayout } from './LegalLayout';
import { ContactLine } from './ContactLine';

const toc = [
  { id: 'what', label: 'What cookies are' },
  { id: 'current', label: 'What we use today' },
  { id: 'future', label: 'Analytics and advertising' },
  { id: 'manage', label: 'Managing your choices' },
  { id: 'contact', label: 'Contact' },
];

export default function Cookies() {
  const meta = staticPages.find((p) => p.path === '/cookies')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  const { required, openSettings } = useConsent();

  return (
    <LegalLayout title="Cookie Policy" intro="What LifeKit stores in your browser, and how that would change if analytics or advertising were added." toc={toc}>
      <h2 id="what">What cookies and local storage are</h2>
      <p>
        Cookies are small text files that websites store in your browser. Local storage is a similar browser feature
        that lets a site save small pieces of data on your device. Both can be “essential” (needed for a feature you
        asked for) or “non-essential” (for example analytics or advertising).
      </p>

      <h2 id="current">What LifeKit uses today</h2>
      <p>LifeKit does not set any cookies of its own. We use local storage for the following essential purposes:</p>
      <div className="not-prose my-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-fg">
            <tr>
              <th className="px-4 py-3 font-semibold">Key</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="px-4 py-3 font-mono text-xs">lifekit:theme</td>
              <td className="px-4 py-3">Remembers whether you chose light or dark mode.</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">Until you clear site data</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-xs">lifekit:consent</td>
              <td className="px-4 py-3">Stores your cookie choices, if a consent banner is shown.</td>
              <td className="px-4 py-3">Essential</td>
              <td className="px-4 py-3">Until you clear site data</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>This data stays on your device and is never sent to us. Your hosting provider may use strictly necessary cookies for security, such as protection against abuse.</p>

      <h2 id="future">Analytics and advertising</h2>
      {adsConfig.enabled ? (
        <p>
          We use Google AdSense to show ads. Google’s advertising cookies (for example those set on the
          doubleclick.net and googlesyndication.com domains) are only loaded if you accept advertising cookies. These
          cookies are used to serve, personalise and measure ads. See{' '}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">how Google uses cookies</a>.
        </p>
      ) : (
        <p>
          We use Vercel Web Analytics to count visits, which works without cookies or local storage. We do not
          currently use advertising cookies. If we add them, for example Google AdSense, we will
          update this policy with a list of the cookies involved, and visitors in regions where consent is required
          will be asked for permission before any non-essential cookies are set.
        </p>
      )}

      <h2 id="manage">Managing your choices</h2>
      <p>
        You can delete local storage and cookies at any time in your browser settings, usually under “Privacy” or
        “Site data”. Doing so resets your theme {required ? 'and consent ' : ''}preferences.
      </p>
      {required && (
        <div className="not-prose my-4">
          <Button onClick={openSettings}>Open cookie settings</Button>
        </div>
      )}
      <p>Read more about how we handle data in our <Link to="/privacy">Privacy Policy</Link>.</p>

      <h2 id="contact">Contact</h2>
      <ContactLine />
    </LegalLayout>
  );
}
