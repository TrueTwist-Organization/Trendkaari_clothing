import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/responsive.css';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { adSlotsToCodeMap } from './utils/adSlots';
import { injectTrackingScriptsFromHtml } from './utils/injectTrackingScripts';
import { preloadAdLibraries } from './utils/preloadAds';
import { installScrollRestoration } from './utils/scrollToTop';

const isAdminRoute =
  typeof window !== 'undefined' &&
  (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));

async function bootstrap() {
  if (!isAdminRoute) {
    installScrollRestoration();

    try {
      const res = await fetch('/api/store/ad-slots');
      if (res.ok) {
        const data = await res.json();
        const codes = adSlotsToCodeMap(data?.adSlots || []);
        if (codes.site_common_ad) {
          injectTrackingScriptsFromHtml(codes.site_common_ad, 'site_common_ad');
        }
        void preloadAdLibraries(codes);
      } else {
        void preloadAdLibraries();
      }
    } catch {
      void preloadAdLibraries();
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>{isAdminRoute ? <AdminApp /> : <App />}</StrictMode>
  );
}

void bootstrap();
