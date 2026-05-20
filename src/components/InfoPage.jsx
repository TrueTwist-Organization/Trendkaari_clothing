import React from 'react';
import { ChevronRight, Mail, Phone } from 'lucide-react';
import PageBackButton from './PageBackButton';
import { getInfoPage } from '../data/footerInfoPages';
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_HOURS,
} from '../constants/contact';
import './InfoPage.css';

export default function InfoPage({ slug, onBack, onBackToHome, onOpenAccount }) {
  const page = getInfoPage(slug);

  if (!page) {
    return (
      <div className="info-page">
        <div className="container info-page__container">
          <div className="info-page__top-bar">
            <PageBackButton onClick={onBack || onBackToHome} />
          </div>
          <nav className="info-page__breadcrumb" aria-label="Breadcrumb">
            <button type="button" className="info-page__crumb-link" onClick={onBackToHome}>
              Home
            </button>
            <ChevronRight size={14} aria-hidden />
            <span>Page not found</span>
          </nav>
          <div className="info-page__hero">
            <h1 className="info-page__title">Page not found</h1>
            <p className="info-page__subtitle">The link you followed is invalid or has moved.</p>
            <button type="button" className="info-page__cta" onClick={onBackToHome}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showTrackCta = slug === 'returns' || slug === 'return-policy';

  return (
    <div className="info-page">
      <div className="container info-page__container">
        <div className="info-page__top-bar">
          <PageBackButton onClick={onBack || onBackToHome} />
        </div>
        <nav className="info-page__breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="info-page__crumb-link" onClick={onBackToHome}>
            Home
          </button>
          <ChevronRight size={14} aria-hidden />
          <span>{page.title}</span>
        </nav>

        <header className="info-page__hero">
          <p className="info-page__eyebrow">trendkaari · Last updated {page.lastUpdated}</p>
          <h1 className="info-page__title">{page.title}</h1>
          {page.subtitle && <p className="info-page__subtitle">{page.subtitle}</p>}
        </header>

        <div className="info-page__layout">
          <article className="info-page__article">
            {page.sections.map((section) => (
              <section key={section.heading} className="info-page__section">
                <h2 className="info-page__section-title">{section.heading}</h2>
                {section.paragraphs?.map((text) => (
                  <p key={text.slice(0, 40)} className="info-page__paragraph">
                    {text}
                  </p>
                ))}
                {section.list && (
                  <ul className="info-page__list">
                    {section.list.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {showTrackCta && onOpenAccount && (
              <div className="info-page__inline-cta">
                <button type="button" className="info-page__cta" onClick={onOpenAccount}>
                  View my orders
                </button>
              </div>
            )}
          </article>

          <aside className="info-page__sidebar" aria-label="Customer support">
            <div className="info-page__support-card">
              <h3>Need help?</h3>
              <p>Our customer care team is here for orders, returns, and sizing questions.</p>
              <a className="info-page__support-row" href={`tel:${SUPPORT_PHONE_TEL}`}>
                <Phone size={16} aria-hidden />
                <span>{SUPPORT_PHONE_DISPLAY}</span>
              </a>
              <a className="info-page__support-row" href={`mailto:${SUPPORT_EMAIL}`}>
                <Mail size={16} aria-hidden />
                <span>{SUPPORT_EMAIL}</span>
              </a>
              <p className="info-page__support-hours">{SUPPORT_HOURS}</p>
              <button type="button" className="info-page__cta info-page__cta--outline" onClick={onBackToHome}>
                Continue shopping
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
