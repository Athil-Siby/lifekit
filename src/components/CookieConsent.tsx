import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { useConsent } from '../hooks/useConsent';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Checkbox } from './ui/Form';

/**
 * Consent banner + preferences dialog. Only rendered when something that needs
 * consent (advertising) is enabled in config/ads.ts.
 */
export function CookieConsent() {
  const { needsDecision, required, save, settingsOpen, openSettings, closeSettings, consent } = useConsent();
  const [ads, setAds] = useState(consent.advertising);

  if (!required) return null;

  return (
    <>
      {needsDecision && !settingsOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[80] p-4 sm:p-6" role="region" aria-label="Cookie consent">
          <div className="animate-fade-up mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-2xl shadow-black/10 sm:flex-row sm:items-center">
            <Cookie className="hidden h-8 w-8 shrink-0 text-accent-text sm:block" aria-hidden />
            <p className="flex-1 text-sm text-fg-muted">
              We use essential storage to remember your preferences. With your permission we would also like to show
              ads, which uses cookies set by our advertising partner. See our{' '}
              <Link to="/cookies" className="text-accent-text underline">Cookie Policy</Link>.
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={openSettings}>Preferences</Button>
              <Button variant="outline" size="sm" onClick={() => save({ analytics: false, advertising: false })}>Reject all</Button>
              <Button size="sm" onClick={() => save({ analytics: false, advertising: true })}>Accept all</Button>
            </div>
          </div>
        </div>
      )}
      <Modal open={settingsOpen} onClose={closeSettings} title="Cookie preferences">
        <div className="space-y-5 p-5">
          <Checkbox checked disabled onChange={() => {}} label="Essential" description="Theme and consent choices, stored in your browser. Always on." />
          <Checkbox checked={ads} onChange={setAds} label="Advertising" description="Allows our advertising partner to set cookies to show and measure ads." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => save({ analytics: false, advertising: false })}>Reject all</Button>
            <Button onClick={() => save({ analytics: false, advertising: ads })}>Save preferences</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
