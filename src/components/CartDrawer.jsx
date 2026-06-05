import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import {
  computeCouponDiscountAmount,
  formatCouponDiscountShort,
} from '../utils/couponDiscount';
import AdSlotEmbed from './AdSlotEmbed';
import './CartDrawer.css';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  coupons = [],
  onOpenCheckout,
  user = null,
  adAboveCheckout = '',
}) {
  const [couponCode, setCouponCode] = useState('');
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Calculate Subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Dynamic Coupon Application
  const handlesApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');

    if (!couponCode) return;
    const codeUpper = couponCode.trim().toUpperCase();
    const found = coupons.find(c => c.code === codeUpper);

    if (found) {
      if (subtotal >= found.minPurchase) {
        setIsCouponApplied(true);
        setAppliedCoupon(found);
      } else {
        setCouponError(`Minimum purchase of ₹${found.minPurchase} required for code ${found.code}!`);
      }
    } else {
      setCouponError('Invalid Coupon Code! Try active codes e.g. SALE100');
    }
  };

  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const saleCoupon = coupons.find((c) => c.code === 'SALE100') || coupons[0];
  const promoMin = saleCoupon?.minPurchase ?? 199;
  const promoOffLabel = saleCoupon ? formatCouponDiscountShort(saleCoupon) : '₹20 off';
  const promoCode = saleCoupon?.code ?? 'SALE100';

  const handleProceedToCheckout = () => {
    onClose();
    onOpenCheckout?.({
      couponCode: isCouponApplied && appliedCoupon ? appliedCoupon.code : couponCode,
      appliedCoupon: isCouponApplied ? appliedCoupon : null,
    });
  };

  const discount =
    isCouponApplied && appliedCoupon ? computeCouponDiscountAmount(appliedCoupon, subtotal) : 0;
  const grandTotal = subtotal - discount;

  return (
    <div className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`}>
      <div className="cart-backdrop" onClick={onClose}></div>
      
      <div className="drawer drawer-right active">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="cart-title-row">
            <ShoppingBag size={18} className="cart-header-icon" />
            <span className="drawer-title">MY SHOPPING BAG</span>
            <span className="cart-items-qty-cnt">({cartItems.length})</span>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close Cart">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="cart-empty-wrapper">
              <ShoppingBag size={64} className="cart-empty-icon" />
              <h4 className="empty-title">YOUR SHOPPING BAG IS EMPTY</h4>
              <p className="empty-subtitle">Looks like you haven't added anything to your bag yet.</p>
              <button className="btn btn-primary empty-shopping-btn" onClick={onClose}>
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            /* Cart Items Bag Scroller */
            <div className="cart-full-wrapper">
              
              {/* Order Goal alert */}
              {subtotal < promoMin ? (
                <div className="cart-promo-alert bg-light-orange">
                  <Sparkles size={14} className="promo-sparkle" />
                  <span>
                    Add <strong>₹{promoMin - subtotal}</strong> more to unlock {promoOffLabel}!
                    Code: <strong>{promoCode}</strong>
                  </span>
                </div>
              ) : (
                <div className="cart-promo-alert bg-light-green">
                  <Sparkles size={14} className="promo-sparkle" />
                  <span>
                    You unlocked {promoOffLabel}! Apply <strong>{promoCode}</strong> below.
                  </span>
                </div>
              )}

              {/* Items Scroller */}
              <div className="cart-items-scroller">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="cart-item-row">
                    <img src={item.image} alt={item.title} className="cart-item-thumb" />
                    
                    <div className="cart-item-details">
                      <h5 className="cart-item-title-text">{item.title}</h5>
                      <span className="cart-item-size-tag">SIZE: <strong>{item.selectedSize}</strong></span>
                      
                      <div className="cart-item-qty-price-row">
                        {/* Qty controls */}
                        <div className="cart-qty-counter">
                          <button 
                            className="cart-qty-btn" 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="cart-qty-display">{item.quantity}</span>
                          <button 
                            className="cart-qty-btn" 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, item.quantity + 1)}
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        
                        <span className="cart-item-price-tag">₹{item.price * item.quantity}</span>
                      </div>
                    </div>

                    <button 
                      className="cart-trash-btn" 
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Form */}
              <div className="cart-coupon-card">
                <div className="coupon-card-header">
                  <Tag size={14} className="coupon-tag-icon" />
                  <span className="coupon-card-title">APPLY PROMO CODE</span>
                </div>
                
                {isCouponApplied && appliedCoupon ? (
                  <div className="applied-coupon-row">
                    <span className="applied-tag">{appliedCoupon.code} APPLIED (-₹{discount})</span>
                    <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>REMOVE</button>
                  </div>
                ) : (
                  <form className="coupon-apply-form" onSubmit={handlesApplyCoupon}>
                    <input 
                      type="text" 
                      placeholder="ENTER PROMO CODE (e.g. SALE100)" 
                      className="coupon-input"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button type="submit" className="coupon-btn">APPLY</button>
                  </form>
                )}
                {couponError && <p className="coupon-err-text">{couponError}</p>}
              </div>

              {/* Bill Details */}
              <div className="cart-totals-summary">
                <div className="totals-row">
                  <span className="totals-label">Bag Subtotal</span>
                  <span className="totals-val">₹{subtotal}</span>
                </div>
                
                {isCouponApplied && (
                  <div className="totals-row discount-row-color">
                    <span className="totals-label">Coupon Discount ({appliedCoupon?.code})</span>
                    <span className="totals-val">- ₹{discount}</span>
                  </div>
                )}

                <div className="totals-row">
                  <span className="totals-label">Shipping</span>
                  <span className="totals-val color-green">FREE</span>
                </div>
                
                <div className="totals-row grand-total-row">
                  <span className="grand-label">Grand Total</span>
                  <span className="grand-val">₹{grandTotal}</span>
                </div>
              </div>

              <AdSlotEmbed html={adAboveCheckout} className="ad-slot-embed--compact" />

              {/* Checkout Button */}
              <button className="btn btn-primary cart-checkout-btn" onClick={handleProceedToCheckout}>
                PROCEED TO CHECKOUT
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
