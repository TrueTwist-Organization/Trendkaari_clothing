import React, { useState } from 'react';
import { Gift, Heart, ShoppingBag, Sparkles, Star } from 'lucide-react';
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

const LOOKS_HER = [
  {
    id: 'her-festive',
    theme: 'emerald',
    badge: 'Festive edit',
    name: 'Embroidered Bloom Suit Set',
    description:
      'Rich embroidered suit with a soft co-ord layer — perfect for family functions and evening pujas.',
    heroImage:
      '/suit-sets/Suit Sets/10/LBL101KS263_1_e108b0e0-b09f-4c9d-a0cd-f9162746a1e8_700x.webp',
    productId: 1031,
    galleryProductIds: [1031],
    price: 348,
  },
  {
    id: 'her-lounge',
    theme: 'burgundy',
    badge: 'Sunday lounge',
    name: 'Linen Stripe Co-ord & Maxi',
    description:
      'Breezy linen co-ord paired with a flowy maxi — your go-to western weekend uniform.',
    heroImage: '/co-ords/co-ord_set/1/1.webp',
    productId: 2101,
    galleryProductIds: [2101],
    price: 348,
  },
  {
    id: 'her-royal',
    theme: 'navy',
    badge: 'Party night',
    name: 'Pastel Lounge & Festive Suit',
    description:
      'Indo-western party edit — pastel co-ord with a festive dupatta suit for sangeet nights.',
    heroImage: '/co-ords/co-ord_set/4/1.webp',
    productId: 2104,
    galleryProductIds: [2104],
    price: 348,
  },
];

const LOOKS_HIM = [
  {
    id: 'him-wedding',
    theme: 'emerald',
    badge: 'Wedding ready',
    name: 'Groom Kurta & Reception Co-ord',
    description:
      'Classic wedding kurta with a sharp navy co-ord for reception — traditional top, modern bottom.',
    heroImage: '/mens/kurtas/kurta/4/xxl-dmm-daswani-exports-original-imahmgj4r2evzddc.webp',
    productId: 3904,
    galleryProductIds: [3904],
    price: 398,
  },
  {
    id: 'him-street',
    theme: 'burgundy',
    badge: 'Street style',
    name: 'Stripe Co-ord & Satin Shirt',
    description:
      'Full stripe co-ord for day plans plus a satin shirt for evening — western weekend sorted.',
    heroImage: '/mens/coords/co-ordset men/co5/3.webp',
    productId: 3405,
    galleryProductIds: [3405],
    price: 348,
  },
  {
    id: 'him-sharp',
    theme: 'navy',
    badge: 'Smart casual',
    name: 'Desert Co-ord & Resort Set',
    description:
      'Office-smart desert co-ord with a peach resort shorts set — travel and meetings covered.',
    heroImage: '/mens/coords/co-ordset men/co9/1.avif',
    productId: 3409,
    galleryProductIds: [3409],
    price: 398,
  },
];

const LOOKS_COUPLE = [
  {
    id: 'couple-sage',
    theme: 'emerald',
    badge: 'Resort match',
    name: 'Sage Breeze Couple Set',
    description: 'Matching sage green linen outfits for a coordinated resort holiday look.',
    heroImage: '/combos/combo-sage-resort.png',
    productId: 2102,
    partnerProductId: 3405,
    galleryProductIds: [2102, 3405],
    price: 699,
  },
  {
    id: 'couple-emerald',
    theme: 'burgundy',
    badge: 'Festive duo',
    name: 'Emerald & Cream Festive Pair',
    description: 'Her emerald suit with his cream kurta — the perfect pair for family celebrations.',
    heroImage: '/combos/combo-emerald-festive.png',
    productId: 1006,
    partnerProductId: 3906,
    galleryProductIds: [1006, 3906],
    price: 749,
  },
  {
    id: 'couple-navy',
    theme: 'navy',
    badge: 'Evening power',
    name: 'Midnight Navy Power Couple',
    description: 'Her silk saree and his structured blazer in matching navy blue for gala nights.',
    heroImage: '/combos/combo-navy-royal.png',
    productId: 1025,
    partnerProductId: 3301,
    galleryProductIds: [1025, 3301],
    price: 899,
  },
  {
    id: 'couple-pink',
    theme: 'emerald',
    badge: 'Wedding match',
    name: 'Blush Pink Wedding Duo',
    description: 'Complementary pink floral lehenga and silk bandhgala for garden weddings.',
    heroImage: '/combos/combo-pink-wedding.png',
    productId: 1015,
    partnerProductId: 3906,
    galleryProductIds: [1015, 3906],
    price: 949,
  },
  {
    id: 'couple-mustard',
    theme: 'burgundy',
    badge: 'Sunny pair',
    name: 'Mustard Bloom Outdoor Set',
    description: 'Cheerful mustard yellow matching outfits for bright outdoor festivities.',
    heroImage: '/combos/combo-mustard-outdoor.png',
    productId: 1039,
    partnerProductId: 3905,
    galleryProductIds: [1039, 3905],
    price: 599,
  },
  {
    id: 'couple-wine',
    theme: 'navy',
    badge: 'Winter lounge',
    name: 'Wine Velvet Winter Combo',
    description: 'Luxurious wine velvet dress and blazer for elegant winter evening parties.',
    heroImage: '/combos/combo-wine-velvet.png',
    productId: 1031,
    partnerProductId: 3906,
    galleryProductIds: [1031, 3906],
    price: 999,
  },
];

const TAB_CONFIG = {
  her: { label: 'For her', icon: Star, looks: LOOKS_HER, shopLabel: 'Shop her combo' },
  couple: {
    label: 'Couple match',
    icon: Heart,
    looks: LOOKS_COUPLE,
    shopLabel: 'Shop couple combo',
    priceLabel: 'Couple gift price',
  },
  him: { label: 'For him', icon: Sparkles, looks: LOOKS_HIM, shopLabel: 'Shop his combo' },
};

function GiftSurpriseCard({ look, tab, onSelectProduct }) {
  const cfg = TAB_CONFIG[tab];
  const priceLabel = cfg.priceLabel || 'Combo gift price';
  const total = look.price;

  const openProduct = () => {
    onSelectProduct?.();
  };

  const handleShop = (e) => {
    e.stopPropagation();
    openProduct();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProduct();
    }
  };

  return (
    <article className={`gift-box gift-box--${look.theme}`}>
      <div
        className="gift-box__card"
        tabIndex={0}
        role="button"
        aria-label={`View ${look.name}`}
        onClick={openProduct}
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
              {cfg.shopLabel}
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
              <p className="gift-box__hint">Hover to untie ribbon</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function GiftCollectionSection({ onSelectProduct, products = [] }) {
  const [tab, setTab] = useState('her');
  const config = TAB_CONFIG[tab];

  const goProduct = (look) => {
    const payload = buildGiftComboPayload({ ...look, tab }, products);
    if (payload && onSelectProduct) {
      onSelectProduct(payload);
      return;
    }
    document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="gift-unbox" aria-labelledby="gift-unbox-title">
      <div className="gift-unbox__inner">
        <header className="gift-unbox__head">
          <h2 id="gift-unbox-title" className="gift-unbox__title">
            Gift Collection
          </h2>
        </header>

        <div className="gift-unbox__tabs" role="tablist">
          {Object.entries(TAB_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                className={`gift-unbox__tab ${tab === key ? 'is-active' : ''}`}
                onClick={() => setTab(key)}
              >
                <Icon size={12} strokeWidth={1.75} aria-hidden />
                {cfg.label}
              </button>
            );
          })}
        </div>

        <div className="gift-unbox__grid" key={tab}>
          {config.looks.map((look) => (
            <GiftSurpriseCard
              key={look.id}
              look={look}
              tab={tab}
              onSelectProduct={() => goProduct(look)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
