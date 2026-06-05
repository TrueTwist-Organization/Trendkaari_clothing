import { useEffect } from 'react';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import './WishlistDrawer.css';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems = [],
  onRemoveItem,
  onAddToCart,
  onSelectProduct,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div className={`wishlist-drawer-overlay ${isOpen ? 'active' : ''}`}>
      <div className="wishlist-backdrop" onClick={onClose} aria-hidden />
      <div className="drawer drawer-right active">
        <div className="drawer-header">
          <div className="wishlist-title-row">
            <Heart size={18} className="wishlist-header-icon" fill="currentColor" />
            <span className="drawer-title">MY WISHLIST</span>
            <span className="wishlist-items-count">({wishlistItems.length})</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close wishlist">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {wishlistItems.length === 0 ? (
            <div className="wishlist-empty">
              <Heart size={64} className="wishlist-empty-icon" />
              <h4 className="wishlist-empty-title">YOUR WISHLIST IS EMPTY</h4>
              <p className="wishlist-empty-sub">Save outfits you love — tap the heart on any product.</p>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="wishlist-items-scroller">
              {wishlistItems.map((item) => (
                <article key={item.id} className="wishlist-item-row">
                  <button
                    type="button"
                    className="wishlist-item-thumb-btn"
                    onClick={() => {
                      onSelectProduct?.(item);
                      onClose();
                    }}
                  >
                    <img src={item.image} alt={item.title} className="wishlist-item-thumb" />
                  </button>

                  <div className="wishlist-item-details">
                    <button
                      type="button"
                      className="wishlist-item-title-btn"
                      onClick={() => {
                        onSelectProduct?.(item);
                        onClose();
                      }}
                    >
                      {item.title}
                    </button>
                    <div className="wishlist-item-price-row">
                      <span className="wishlist-price">₹{item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="wishlist-price-orig">₹{item.originalPrice}</span>
                      )}
                    </div>
                    {item.selectedSize && (
                      <span className="wishlist-size-tag">Size: {item.selectedSize}</span>
                    )}
                    <button
                      type="button"
                      className="btn btn-primary wishlist-add-bag-btn"
                      onClick={() => {
                        const size = item.selectedSize || item.sizes?.[0] || 'M';
                        onAddToCart?.(item, size, 1);
                      }}
                    >
                      <ShoppingBag size={14} />
                      ADD TO BAG
                    </button>
                  </div>

                  <button
                    type="button"
                    className="wishlist-remove-btn"
                    onClick={() => onRemoveItem?.(item.id)}
                    aria-label={`Remove ${item.title} from wishlist`}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
