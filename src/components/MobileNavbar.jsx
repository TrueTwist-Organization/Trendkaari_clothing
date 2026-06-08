import React from 'react';
import { Home, Heart, User, ShoppingBag } from 'lucide-react';
import './MobileNavbar.css';

export default function MobileNavbar({
  activeCategory,
  onSelectCategory,
  onOpenWishlist,
  onOpenProfile,
  onOpenCart,
  cartCount = 0,
  isCartOpen = false,
}) {
  const handleHomeClick = () => {
    onSelectCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mobile-bottom-navbar">
      <button
        type="button"
        className={`mobile-nav-tab-btn ${activeCategory === 'all' && !isCartOpen ? 'active' : ''}`}
        onClick={handleHomeClick}
      >
        <Home size={20} />
        <span className="mobile-nav-tab-label">Home</span>
      </button>

      <button type="button" className="mobile-nav-tab-btn" onClick={onOpenWishlist}>
        <Heart size={20} />
        <span className="mobile-nav-tab-label">Wishlist</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-tab-btn mobile-nav-tab-btn--cart${isCartOpen ? ' active' : ''}`}
        onClick={onOpenCart}
        aria-label={`Shopping bag${cartCount ? `, ${cartCount} items` : ''}`}
      >
        <span className="mobile-nav-cart-icon-wrap">
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="mobile-nav-cart-badge" aria-hidden>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </span>
        <span className="mobile-nav-tab-label">Bag</span>
      </button>

      <button type="button" className="mobile-nav-tab-btn" onClick={onOpenProfile}>
        <User size={20} />
        <span className="mobile-nav-tab-label">Account</span>
      </button>
    </div>
  );
}
