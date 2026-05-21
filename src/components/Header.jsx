import React, { useState, useEffect } from 'react';
import { Menu, Search, User, Heart, ShoppingBag } from 'lucide-react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC } from '../constants/brand';
import './Header.css';

export default function Header({
  cartCount,
  wishlistCount,
  user,
  onOpenMenu,
  onOpenSearch,
  onOpenCart,
  onOpenWishlist,
  onOpenProfile,
  onLogoClick,
  solidHeader = false,
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (solidHeader) return undefined;

    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (y > 80) return true;
        if (y < 20) return false;
        return prev;
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [solidHeader]);

  const headerScrolled = solidHeader || isScrolled;

  return (
    <header className={`libas-header-wrapper ${headerScrolled ? 'scrolled' : ''}`}>
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>SHOP ₹199+ & GET FLAT ₹20 OFF | USE CODE: SALE100</span>
          <span className="divider-dot">•</span>
          <span className="mobile-hidden">FREE SHIPPING ON ALL ORDERS WITHIN INDIA</span>
          <span className="divider-dot mobile-hidden">•</span>
          <span>EASY 7-DAY RETURNS</span>
        </div>
      </div>

      {/* Main Header Area */}
      <div className="main-header">
        <div className="header-container">
          {/* Left: Menu & Search */}
          <div className="header-left">
            <button className="header-btn" onClick={onOpenMenu} aria-label="Open Menu">
              <Menu size={20} />
              <span className="btn-label">MENU</span>
            </button>
            <button
              type="button"
              className="header-search-trigger"
              onClick={onOpenSearch}
              aria-label="Search products, brands and more"
            >
              <span className="header-search-trigger__icon-wrap" aria-hidden>
                <Search size={20} strokeWidth={2} />
              </span>
              <span className="header-search-trigger__text">Search</span>
            </button>
          </div>

          {/* Center: Brand Logo */}
          <div className="header-center">
            <a 
              href="/" 
              className="brand-logo"
              onClick={(e) => {
                if (onLogoClick) {
                  e.preventDefault();
                  onLogoClick();
                }
              }}
            >
              <div className="flexfit-logo-container">
                <img
                  src={SITE_LOGO_SRC}
                  alt={SITE_LOGO_ALT}
                  className="flexfit-logo-img"
                  width={420}
                  height={84}
                  decoding="async"
                />
              </div>
            </a>
          </div>

          {/* Right: Actions */}
          <div className="header-right">
            <button
              type="button"
              className="header-icon-btn header-account-btn header-laptop-only"
              onClick={onOpenProfile}
              aria-label={user ? 'My Account' : 'Login'}
            >
              <User size={20} />
              {user && <span className="account-dot" title={user.name} />}
            </button>

            <button
              type="button"
              className="header-icon-btn header-laptop-only"
              onClick={onOpenWishlist}
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && <span className="badge-indicator">{wishlistCount}</span>}
            </button>

            <button className="header-icon-btn cart-toggle-btn" onClick={onOpenCart} aria-label="Shopping Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="badge-indicator cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
