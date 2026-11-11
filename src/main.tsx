import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { ThemeProvider } from './hooks/useTheme';
import { ConsentProvider } from './hooks/useConsent';
import { ToastProvider } from './components/ui/Toast';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ConsentProvider>
        <ToastProvider>
          <App />
          {/* Cookieless, aggregate page-view counts (Vercel Web Analytics). See Privacy Policy. */}
          <Analytics />
        </ToastProvider>
      </ConsentProvider>
    </ThemeProvider>
  </StrictMode>,
);
