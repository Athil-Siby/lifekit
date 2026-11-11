import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { consentRequired } from '../config/ads';
import { readStorage, writeStorage } from '../lib/storage';

/**
 * Minimal consent store. This is an integration point, not a certified CMP:
 * if you serve personalised ads to visitors in the EEA, UK or Switzerland,
 * Google requires a Google-certified CMP (see README). Replace or wire this
 * provider to that CMP's API when advertising is enabled.
 */
export interface ConsentState {
  analytics: boolean;
  advertising: boolean;
  decidedAt: string | null;
  version: number;
}

const CONSENT_VERSION = 1;
const defaultConsent: ConsentState = { analytics: false, advertising: false, decidedAt: null, version: CONSENT_VERSION };

interface ConsentContextValue {
  consent: ConsentState;
  /** True when a decision is needed and has not yet been made. */
  needsDecision: boolean;
  required: boolean;
  save: (c: Pick<ConsentState, 'analytics' | 'advertising'>) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(() => {
    const stored = readStorage<ConsentState>('consent', defaultConsent);
    return stored.version === CONSENT_VERSION ? stored : defaultConsent;
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  const save = useCallback((c: Pick<ConsentState, 'analytics' | 'advertising'>) => {
    const next = { ...c, decidedAt: new Date().toISOString(), version: CONSENT_VERSION };
    setConsent(next);
    writeStorage('consent', next);
    setSettingsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      consent,
      needsDecision: consentRequired && consent.decidedAt === null,
      required: consentRequired,
      save,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    }),
    [consent, save, settingsOpen],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider');
  return ctx;
}
