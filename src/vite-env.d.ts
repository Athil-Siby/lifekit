/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_CONTACT_ENDPOINT?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_ADS_ENABLED?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_AD_SLOT_HOME?: string;
  readonly VITE_AD_SLOT_TOOL?: string;
  readonly VITE_AD_SLOT_DIRECTORY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'mammoth/mammoth.browser';
declare module 'html-to-pdfmake';
declare module 'pdfmake/build/vfs_fonts';
