import React, { useState } from 'react';
import { Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import { SITE_NAME } from '../constants/brand';
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_EMAIL,
  SUPPORT_HOURS,
} from '../constants/contact';
import './Footer.css';

const SALE_MESSAGE =
  '🏷️ SALE ALERT!\n\nUse Code: SALE100 to get Flat ₹100 Off on orders above ₹2499!\n\nUse Code: APP10 to get 10% Extra Off on our Mobile Apps!';

export default function Footer({
  onSelectCategory,
  onOpenAccount,
  onScrollToSection,
  onNavigateInfoPage,
  siteSettings = null,
}) {
  const [activeCol, setActiveCol] = useState(null);

  const toggleCol = (index) => {
    setActiveCol((prev) => (prev === index ? null : index));
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing to ${siteSettings?.siteName || SITE_NAME} Newsletter!`);
    e.target.reset();
  };

  const goCategory = (category) => {
    onSelectCategory?.(category);
  };

  const openInfo = (key) => {
    onNavigateInfoPage?.(key);
  };

  const handleGiftCards = () => {
    onScrollToSection?.('gift-unbox-title');
  };

  const handleSale = () => {
    alert(SALE_MESSAGE);
  };

  const handleTrackOrder = () => {
    onOpenAccount?.();
  };

  return (
    <footer className="libas-footer-wrapper">
      <svg className="footer-star-print footer-print-1" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
      </svg>
      <svg className="footer-star-print footer-print-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
      </svg>
      <svg className="footer-star-print footer-print-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
      </svg>
      <svg className="footer-star-print footer-print-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
      </svg>

      <div className="container">
        <div className="occasion-bar">
          <span className="occasion-title text-uppercase letter-spacing-medium">Shop By Occasion:</span>
          <div className="occasion-links-list">
            <button type="button" onClick={() => goCategory('suit sets')} className="occasion-link">
              Mother&apos;s Day Outfits
            </button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goCategory('suit sets')} className="occasion-link">
              Mehendi Outfits
            </button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goCategory('suit sets')} className="occasion-link">
              Haldi Outfits
            </button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goCategory('sarees')} className="occasion-link">
              Wedding Suits For Women
            </button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goCategory('kurtas')} className="occasion-link">
              Festive Wear
            </button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goCategory('tops')} className="occasion-link">
              Daily Wear Tunics
            </button>
          </div>
        </div>

        <div className="footer-columns-grid">
          <div className={`footer-column-col ${activeCol === 1 ? 'active' : ''}`}>
            <h4 className="column-title" onClick={() => toggleCol(1)}>
              CONTACT US & DISCOVER
              <span className="accordion-caret" />
            </h4>
            <div className="column-collapsible-content">
              <div className="contact-details-box">
                <a className="contact-row contact-row--link" href={`tel:${SUPPORT_PHONE_TEL}`}>
                  <Phone size={14} className="contact-icon" />
                  <span>{SUPPORT_PHONE_DISPLAY}</span>
                </a>
                <a className="contact-row contact-row--link" href={`mailto:${SUPPORT_EMAIL}`}>
                  <Mail size={14} className="contact-icon" />
                  <span>{SUPPORT_EMAIL}</span>
                </a>
                <div className="contact-row">
                  <Clock size={14} className="contact-icon" />
                  <span>{SUPPORT_HOURS}</span>
                </div>
              </div>
              <ul className="footer-links-list">
                <li>
                  <button type="button" className="footer-link-btn" onClick={handleGiftCards}>
                    Gift Cards
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={handleSale}>
                    Sale
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className={`footer-column-col ${activeCol === 2 ? 'active' : ''}`}>
            <h4 className="column-title" onClick={() => toggleCol(2)}>
              EXPLORE MORE
              <span className="accordion-caret" />
            </h4>
            <div className="column-collapsible-content">
              <ul className="footer-links-list two-cols">
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('all')}>
                    All Collections
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('dupatta sets')}>
                    Dupatta Sets
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('kurtas')}>
                    Kurtas
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('suit sets')}>
                    Suit Sets
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('sarees')}>
                    Sarees
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('lehengas')}>
                    Lehengas
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => goCategory('tops')}>
                    Tops & Tunics
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className={`footer-column-col ${activeCol === 3 ? 'active' : ''}`}>
            <h4 className="column-title" onClick={() => toggleCol(3)}>
              CUSTOMER EXPERIENCE
              <span className="accordion-caret" />
            </h4>
            <div className="column-collapsible-content">
              <ul className="footer-links-list two-cols">
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('about')}>
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={handleTrackOrder}>
                    Track Order
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('returns')}>
                    Raise Return
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('terms')}>
                    Terms & Cond.
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('shipping')}>
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('return-policy')}>
                    Return Policy
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('refund')}>
                    Refund Policy
                  </button>
                </li>
                <li>
                  <button type="button" className="footer-link-btn" onClick={() => openInfo('faq')}>
                    FAQ&apos;s
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className={`footer-column-col ${activeCol === 4 ? 'active' : ''}`}>
            <h4 className="column-title" onClick={() => toggleCol(4)}>
              SUBSCRIBE & CONNECT
              <span className="accordion-caret" />
            </h4>
            <div className="column-collapsible-content">
              <div className="subscribe-box">
                <p className="subscribe-subtitle">
                  Be the first to know about new launches, sales, trend updates & more!
                </p>
                <form className="subscribe-form" onSubmit={handleSubscribeSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="subscribe-input"
                    required
                  />
                  <button type="submit" className="subscribe-btn" aria-label="Subscribe">
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="social-connect-block">
                <span className="social-title">FOLLOW US</span>
                <div className="social-icons-row">
                  <a
                    href="https://instagram.com"
                    className="social-icon-circle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    className="social-icon-circle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  </a>
                  <a
                    href="https://youtube.com"
                    className="social-icon-circle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                  </a>
                  <a
                    href="https://twitter.com"
                    className="social-icon-circle"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {siteSettings?.footerText ? (
          <div className="footer-site-blurb">
            <p>{siteSettings.footerText}</p>
          </div>
        ) : null}

        <div className="footer-copyright-bottom">
          <p>
            Design by{' '}
            <a
              href="https://truetwist.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              True Twist
            </a>
            {' · '}
            Marketing by{' '}
            <a
              href="https://369network.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-credit-link"
            >
              369Network
            </a>
          </p>
        </div>
      </div>

    </footer>
  );
}
