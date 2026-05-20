import React from 'react';
import { Home, Sparkles, Tag, Heart, User } from 'lucide-react';
import './MobileNavbar.css';

export default function MobileNavbar({
  activeCategory,
  onSelectCategory,
  onOpenWishlist,
  onOpenProfile,
  onOpenCart
}) {
  const handleHomeClick = () => {
    onSelectCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewClick = () => {
    onSelectCategory('new arrivals');
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSaleClick = () => {
    alert("🏷️ SALE ALERT!\n\nUse Code: SALE100 to get Flat ₹100 Off on orders above ₹2499!\n\nUse Code: APP10 to get 10% Extra Off on our Mobile Apps!");
  };

  return (
    <div className="mobile-bottom-navbar">
      
      {/* Home tab */}
      <button 
        className={`mobile-nav-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={handleHomeClick}
      >
        <Home size={20} />
        <span className="mobile-nav-tab-label">Home</span>
      </button>

      {/* New In tab */}
      <button 
        className={`mobile-nav-tab-btn ${activeCategory === 'new arrivals' ? 'active' : ''}`}
        onClick={handleNewClick}
      >
        <Sparkles size={20} />
        <span className="mobile-nav-tab-label">New</span>
      </button>

      {/* Sale tab */}
      <button 
        className="mobile-nav-tab-btn"
        onClick={handleSaleClick}
      >
        <Tag size={20} />
        <span className="mobile-nav-tab-label">Sale</span>
      </button>

      {/* Wishlist tab */}
      <button 
        className="mobile-nav-tab-btn"
        onClick={onOpenWishlist}
      >
        <Heart size={20} />
        <span className="mobile-nav-tab-label">Wishlist</span>
      </button>

      {/* Account tab */}
      <button 
        className="mobile-nav-tab-btn"
        onClick={onOpenProfile}
      >
        <User size={20} />
        <span className="mobile-nav-tab-label">Account</span>
      </button>

    </div>
  );
}
