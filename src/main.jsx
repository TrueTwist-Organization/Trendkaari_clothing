import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/responsive.css';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';
import { adSlotsToCodeMap } from './utils/adSlots';
import { injectTrackingScriptsFromHtml } from './utils/injectTrackingScripts';

const isAdminRoute =
  typeof window !== 'undefined' &&
  (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));

async function bootstrap() {
  if (!isAdminRoute) {
    try {
      const res = await fetch('/api/store/ad-slots');
      if (res.ok) {
        const data = await res.json();
        const codes = adSlotsToCodeMap(data?.adSlots || []);
        if (codes.site_common_ad) {
          injectTrackingScriptsFromHtml(codes.site_common_ad, 'site_common_ad');
        }
      }
    } catch {
      // App will retry after mount
    }
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>{isAdminRoute ? <AdminApp /> : <App />}</StrictMode>
  );
}

void bootstrap();
