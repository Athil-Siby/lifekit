/**
 * Legal page settings. EDIT THESE before launch.
 * The policy texts in src/pages/legal/*.tsx describe how the site works as built.
 * They are a starting point, not legal advice: have them reviewed for your
 * jurisdiction, and update them whenever you add analytics, ads or a backend.
 */
export const legalConfig = {
  /** Shown as "Last updated" on each legal page. */
  lastUpdated: '11 November 2026',
  /**
   * The person or business legally responsible for the site, e.g. "Jane Doe" or "Example Ltd".
   * Leave empty to refer to "the operator of LifeKit".
   */
  operatorName: 'Athil Siby',
  /** Optional postal address or jurisdiction line for the operator. */
  operatorLocation: 'United Arab Emirates',
};

export const operatorLabel = legalConfig.operatorName || 'the operator of LifeKit';
