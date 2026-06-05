import { useMemo, useState } from 'react';
import {
  Truck,
  RefreshCw,
  ShieldCheck,
  Tag,
  Sparkles,
  Wallet,
  Receipt,
  MapPin,
  Home,
  Plus,
  ChevronRight,
} from 'lucide-react';
import ProductDiscountChip from '../components/ProductDiscountChip';
import { getCheckoutStepExtras } from './checkoutStepExtrasConfig';
import { CHECKOUT_STEPS } from './checkoutSteps';

const PERK_ICONS = {
  truck: Truck,
  refresh: RefreshCw,
  shield: ShieldCheck,
  tag: Tag,
  sparkles: Sparkles,
  wallet: Wallet,
  receipt: Receipt,
  map: MapPin,
  home: Home,
};

function pickSuggestions(allProducts, cartItems, limit = 6) {
  const inCart = new Set(cartItems.map((i) => i.id));
  const cartCategories = new Set(cartItems.map((i) => i.category).filter(Boolean));
  const pool = allProducts.filter((p) => p?.id && !inCart.has(p.id) && p.image);

  const sameCat = pool.filter((p) => cartCategories.has(p.category));
  const rest = pool.filter((p) => !cartCategories.has(p.category));
  return [...sameCat, ...rest].slice(0, limit);
}

export function CheckoutTipBanner({ tip }) {
  if (!tip?.text) return null;
  const tone = tip.tone || 'calm';

  return (
    <div className={`co-extra-tip co-extra-tip--${tone}`}>
      <div className="co-extra-tip__glow" aria-hidden />
      <div className="co-extra-tip__body">
        {tip.title && <strong className="co-extra-tip__title">{tip.title}</strong>}
        <p className="co-extra-tip__text">{tip.text}</p>
      </div>
    </div>
  );
}

export function CheckoutPerksStrip({ perks = [] }) {
  if (!perks.length) return null;

  return (
    <div className="co-extra-perks" role="list">
      {perks.map((perk) => {
        const Icon = PERK_ICONS[perk.icon] || Sparkles;
        return (
          <div key={perk.label} className="co-extra-perk" role="listitem">
            <span className="co-extra-perk__icon" aria-hidden>
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <span className="co-extra-perk__copy">
              <strong>{perk.label}</strong>
              {perk.sub && <small>{perk.sub}</small>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CheckoutProductSuggestions({
  title,
  subtitle,
  products,
  cartItems,
  onAddToCart,
  onSelectProduct,
}) {
  const suggestions = useMemo(
    () => pickSuggestions(products, cartItems),
    [products, cartItems]
  );
  const [addedId, setAddedId] = useState(null);

  if (!suggestions.length) return null;

  const handleQuickAdd = (product) => {
    const size = product.sizes?.[0];
    if (!size || !onAddToCart) return;
    onAddToCart(product, size, 1);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="co-extra-suggest" aria-label={title || 'Product suggestions'}>
      <header className="co-extra-suggest__head">
        <div>
          <p className="co-extra-suggest__eyebrow">{subtitle || 'Recommended for you'}</p>
          <h3 className="co-extra-suggest__title">{title || 'You may also like'}</h3>
        </div>
        <Sparkles size={18} className="co-extra-suggest__spark" aria-hidden />
      </header>
      <div className="co-extra-suggest__track">
        {suggestions.map((item) => {
          const defaultSize = item.sizes?.[0];
          const justAdded = addedId === item.id;

          return (
            <article key={item.id} className="co-extra-suggest-card">
              <button
                type="button"
                className="co-extra-suggest-card__media"
                onClick={() => onSelectProduct?.(item)}
                aria-label={`View ${item.title}`}
              >
                <img src={item.image} alt="" loading="lazy" />
                <span className="co-extra-suggest-card__shine" aria-hidden />
              </button>
              <div className="co-extra-suggest-card__body">
                <button
                  type="button"
                  className="co-extra-suggest-card__title"
                  onClick={() => onSelectProduct?.(item)}
                >
                  {item.title}
                </button>
                <div className="co-extra-suggest-card__price">
                  <span>₹{item.price}</span>
                  <ProductDiscountChip product={item} className="product-discount-chip--compact" />
                </div>
                <button
                  type="button"
                  className={`co-extra-suggest-card__add ${justAdded ? 'is-added' : ''}`}
                  disabled={!defaultSize}
                  onClick={() => handleQuickAdd(item)}
                >
                  {justAdded ? (
                    <>Added ✓</>
                  ) : (
                    <>
                      <Plus size={14} /> Quick add
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function CheckoutFreeShipBar({ subtotal, target = 199 }) {
  const pct = Math.min(100, Math.round((subtotal / target) * 100));
  const remaining = Math.max(0, target - subtotal);
  const unlocked = remaining <= 0;

  return (
    <div className={`co-free-ship-bar ${unlocked ? 'is-unlocked' : ''}`}>
      <div className="co-free-ship-bar__row">
        <Truck size={16} aria-hidden />
        <span>
          {unlocked ? (
            <>
              <strong>Free shipping unlocked!</strong> You&apos;re all set.
            </>
          ) : (
            <>
              Add <strong>₹{remaining}</strong> more for free express delivery
            </>
          )}
        </span>
        <ChevronRight size={14} className="co-free-ship-bar__chev" aria-hidden />
      </div>
      <div className="co-free-ship-bar__track" aria-hidden>
        <span className="co-free-ship-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Renders tip, perks, and/or suggestions below the main checkout card */
export default function CheckoutStepExtras({
  step,
  cartItems,
  subtotal,
  allProducts = [],
  onAddToCart,
  onSelectProduct,
}) {
  const extras = getCheckoutStepExtras(step, CHECKOUT_STEPS);
  if (!extras) return null;

  const showSuggest = extras.showSuggestions && allProducts.length > 0;

  return (
    <div className={`co-step-extras ${showSuggest ? 'co-step-extras--wide' : ''}`}>
      {extras.perks?.length > 0 && <CheckoutPerksStrip perks={extras.perks} />}
      {showSuggest && (
        <>
          <p className="co-extra-scroll-hint">Scroll for more picks ↓</p>
          <CheckoutProductSuggestions
            title={extras.suggestionsTitle}
            subtitle={extras.suggestionsSubtitle}
            products={allProducts}
            cartItems={cartItems}
            onAddToCart={onAddToCart}
            onSelectProduct={onSelectProduct}
          />
        </>
      )}
      {extras.tip && <CheckoutTipBanner tip={extras.tip} />}
    </div>
  );
}
