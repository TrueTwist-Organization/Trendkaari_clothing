import React, { useEffect, useState } from 'react';
import { Gift, Heart, ShoppingBag } from 'lucide-react';
import { buildGiftComboPayload } from '../utils/giftComboProduct';
import './GiftCollectionSection.css';

function formatPrice(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Real 3D Bow — reference image 2 style */
function GiftBow() {
  return (
    <div className="gift-box__bow" aria-hidden>
      <span className="gift-box__bow-loop gift-box__bow-loop--l" />
      <span className="gift-box__bow-loop gift-box__bow-loop--r" />
      <span className="gift-box__bow-knot">
        <Gift size={14} strokeWidth={1.85} />
      </span>
      <span className="gift-box__bow-tail gift-box__bow-tail--l" />
      <span className="gift-box__bow-tail gift-box__bow-tail--r" />
    </div>
  );
}

function GiftSurpriseCard({ look, onSelectProduct }) {
  const priceLabel = 'Couple gift price';
  const total = look.price;
  const [isOpen, setIsOpen] = useState(false);
  const [tapMode, setTapMode] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const sync = () => setTapMode(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const openProduct = () => {
    onSelectProduct?.();
  };

  const handleCardClick = () => {
    if (tapMode && !isOpen) {
      setIsOpen(true);
      return;
    }
    openProduct();
  };

  const handleShop = (e) => {
    e.stopPropagation();
    openProduct();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (tapMode && !isOpen) {
        setIsOpen(true);
        return;
      }
      openProduct();
    }
  };

  return (
    <article className={`gift-box gift-box--${look.theme}`}>
      <div
        className={`gift-box__card${isOpen ? ' is-open' : ''}`}
        tabIndex={0}
        role="button"
        aria-label={`View ${look.name}`}
        aria-expanded={isOpen}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
      >
        <div className="gift-box__layer gift-box__layer--reveal">
          <div className="gift-box__reveal-media">
            <span className="gift-box__badge">{look.badge}</span>
            <img src={look.heroImage} alt="" className="gift-box__hero" loading="lazy" />
          </div>
          <div className="gift-box__reveal-body">
            <div className="gift-box__reveal-top">
              <span className="gift-box__combo-label">Out-of-box combo</span>
              <button type="button" className="gift-box__wish" aria-label="Add to wishlist">
                <Heart size={16} strokeWidth={1.75} />
              </button>
            </div>
            <h3 className="gift-box__title">{look.name}</h3>
            <p className="gift-box__desc">{look.description}</p>
            <div className="gift-box__price-row">
              <span className="gift-box__price-label">{priceLabel}</span>
              <span className="gift-box__price">{formatPrice(total)}</span>
            </div>
            <button type="button" className="gift-box__shop-btn" onClick={handleShop}>
              <ShoppingBag size={15} strokeWidth={2} aria-hidden />
              Shop couple combo
            </button>
          </div>
        </div>

        <div className="gift-box__face">
          <div className="gift-box__face-panel gift-box__face-panel--top" aria-hidden />
          <div className="gift-box__face-panel gift-box__face-panel--bottom" aria-hidden />

          <div className="gift-box__face-deco">
            <span className="gift-box__ribbon gift-box__ribbon--v" aria-hidden />
            <span className="gift-box__ribbon gift-box__ribbon--h" aria-hidden />
            <GiftBow />
            <div className="gift-box__wrap-text">
              <p className="gift-box__surprise">Unboxing surprise</p>
              <p className="gift-box__hint gift-box__hint--hover">Hover to untie ribbon</p>
              <p className="gift-box__hint gift-box__hint--tap">Tap to untie ribbon</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function GiftCollectionSection({ onSelectProduct, products = [], giftCombos = [] }) {
  const combos = Array.isArray(giftCombos) ? giftCombos : [];

  const goProduct = (look) => {
    const payload = buildGiftComboPayload({ ...look, tab: 'couple' }, products);
    if (payload && onSelectProduct) {
      onSelectProduct(payload);
    }
  };

  return (
    <section className="gift-unbox" aria-labelledby="gift-unbox-title">
      <div className="gift-unbox__inner">
        <header className="gift-unbox__head">
          <h2 id="gift-unbox-title" className="gift-unbox__title">
            Gift Collection
          </h2>
        </header>

        {combos.length === 0 ? (
          <p className="gift-unbox__empty">Gift combos will appear here once added in Admin → Gift Combos.</p>
        ) : (
          <div className="gift-unbox__grid gift-unbox__grid--duo">
            {combos.map((look) => (
              <GiftSurpriseCard
                key={look.id}
                look={look}
                onSelectProduct={() => goProduct(look)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
