import React, { useState } from 'react';
import { X, Sparkles, MapPin, Gift, Phone, ChevronDown } from 'lucide-react';
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from '../constants/contact';
import { MENU_WOMEN_GROUPS, MENU_MEN_GROUPS } from '../data/navCategories';
import './MenuDrawer.css';

function MenuWearGroup({ group, onSelectCategory }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((open) => !open);

  return (
    <div className="menu-wear-group">
      <div className="menu-wear-group-header">
        <button
          type="button"
          className="menu-wear-group-title"
          onClick={toggleExpanded}
          aria-expanded={expanded}
        >
          {group.label.toUpperCase()}
        </button>
        <button
          type="button"
          className="menu-wear-group-toggle"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${group.label}`}
        >
          <ChevronDown size={16} className={expanded ? 'is-open' : ''} />
        </button>
      </div>
      {expanded && (
        <div className="menu-wear-sublist">
          <div
            className="nav-item-link nav-item-link--nested nav-item-link--view-all"
            onClick={() => onSelectCategory(group.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectCategory(group.id);
            }}
          >
            <span>View all {group.label}</span>
          </div>
          {group.categories.map((cat) => (
            <div
              key={cat.tag}
              className="nav-item-link nav-item-link--nested"
              onClick={() => onSelectCategory(cat.tag)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectCategory(cat.tag);
              }}
            >
              <span>{cat.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuGenderSection({ label, groups, onSelectCategory }) {
  return (
    <>
      <p className="menu-nav-section-label">{label}</p>
      {groups.map((group) => (
        <MenuWearGroup key={group.id} group={group} onSelectCategory={onSelectCategory} />
      ))}
    </>
  );
}

export default function MenuDrawer({ isOpen, onClose, onSelectCategory }) {
  const menuKey = isOpen ? 'open' : 'closed';

  const handleNavClick = (category) => {
    onSelectCategory(category);
    onClose();
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <div className={`menu-drawer-wrapper ${isOpen ? 'active' : ''}`}>
      <div className="menu-backdrop" onClick={onClose} />
      <div className="drawer drawer-left active">
        <div className="drawer-header">
          <span className="drawer-title">CATEGORIES</span>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close Menu">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          <nav className="menu-nav-links">
            <div
              className="nav-item-link highlight"
              onClick={() => handleNavClick('all')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNavClick('all');
              }}
            >
              <Sparkles size={16} className="nav-icon-plum" />
              <span>ALL COLLECTIONS</span>
            </div>

            <MenuGenderSection
              key={`women-${menuKey}`}
              label="Women"
              groups={MENU_WOMEN_GROUPS}
              onSelectCategory={handleNavClick}
            />

            <MenuGenderSection
              key={`men-${menuKey}`}
              label="Men"
              groups={MENU_MEN_GROUPS}
              onSelectCategory={handleNavClick}
            />
          </nav>

          <div className="menu-drawer-contact">
            <div className="menu-contact-row">
              <MapPin size={14} />
              <span>Find Stores Near Me</span>
            </div>
            <div className="menu-contact-row">
              <Gift size={14} />
              <span>Check Gift Cards</span>
            </div>
            <a className="menu-contact-row menu-contact-row--link" href={`tel:${SUPPORT_PHONE_TEL}`}>
              <Phone size={14} />
              <span>Customer Care: {SUPPORT_PHONE_DISPLAY}</span>
            </a>
          </div>

          <div className="menu-socials-row">
            <a href="https://instagram.com" className="menu-soc" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href="https://facebook.com" className="menu-soc" target="_blank" rel="noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://youtube.com" className="menu-soc" target="_blank" rel="noreferrer" aria-label="YouTube">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
            </a>
            <a href="https://twitter.com" className="menu-soc" target="_blank" rel="noreferrer" aria-label="Twitter">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
