import { SITE_NAME } from '../constants/brand';

export const DEFAULT_SITE_SETTINGS = {
  siteName: SITE_NAME,
  tagline: 'Shop For Everyone',
  seoKeywords:
    'shopping, ethnic wear, kurtas, sarees, lehengas, trendkaari, indian fashion',
  metaDescription:
    'Shop the latest Indian ethnic wear and modern luxury fashion at trendkaari.',
  footerText:
    'trendkaari — curated Indian ethnic & contemporary wear for festivals, weddings, and everyday style.',
};

export function applySiteSettingsToDocument(settings = {}) {
  const s = { ...DEFAULT_SITE_SETTINGS, ...settings };
  const title = s.tagline
    ? `${s.siteName} | ${s.tagline}`
    : `${s.siteName} | Indian Ethnic Wear & Fashion`;
  document.title = title;

  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', s.metaDescription || DEFAULT_SITE_SETTINGS.metaDescription);

  let metaKw = document.querySelector('meta[name="keywords"]');
  if (!metaKw) {
    metaKw = document.createElement('meta');
    metaKw.setAttribute('name', 'keywords');
    document.head.appendChild(metaKw);
  }
  metaKw.setAttribute('content', s.seoKeywords || DEFAULT_SITE_SETTINGS.seoKeywords);

  return s;
}
