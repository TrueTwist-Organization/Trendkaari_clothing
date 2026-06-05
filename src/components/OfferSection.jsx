import React from 'react';
import { Sparkles, Tag, Truck } from 'lucide-react';
import './OfferSection.css';

const POLAROIDS = [
  {
    id: 'her',
    label: 'FOR HER',
    caption: 'Festive suits & lehengas',
    image: '/combos/combo-velvet-rose-her.png',
    rotate: -9,
    className: 'offer-polaroid--1',
  },
  {
    id: 'him',
    label: 'FOR HIM',
    caption: 'Kurta sets & more',
    image: '/combos/combo-velvet-rose-him.png',
    rotate: 7,
    className: 'offer-polaroid--2',
  },
  {
    id: 'couple',
    label: 'COUPLE MATCH',
    caption: 'Matching celebration looks',
    image: '/combos/combo-velvet-rose-couple.png',
    rotate: -4,
    className: 'offer-polaroid--3',
  },
];

const OFFER_PILLS = [
  { icon: Tag, text: 'Up to 50% OFF' },
  { icon: Sparkles, text: 'First order extra 35%' },
  { icon: Truck, text: 'Easy returns' },
];

const MARQUEE_OFFERS = [
  'UP TO 50% OFF',
  'FIRST ORDER EXTRA 35%',
  'EASY 15-DAY RETURNS',
  'FESTIVE COMBO OFFERS',
  'FREE SHIPPING ON ORDERS ₹1999+',
  'SHOP ETHNIC & CONTEMPORARY WEAR',
  'LIMITED TIME — SHOP THE EDIT',
];

function OfferMarquee() {
  const items = MARQUEE_OFFERS.map((text) => (
    <span key={text} className="offer-marquee__item">
      <Sparkles size={13} strokeWidth={2} aria-hidden />
      <span>{text}</span>
      <span className="offer-marquee__sep" aria-hidden>
        ✦
      </span>
    </span>
  ));

  return (
    <div className="offer-marquee" aria-label="Current offers">
      <div className="offer-marquee__fade offer-marquee__fade--left" aria-hidden />
      <div className="offer-marquee__fade offer-marquee__fade--right" aria-hidden />
      <div className="offer-marquee__viewport">
        <div className="offer-marquee__track">
          <div className="offer-marquee__group">{items}</div>
          <div className="offer-marquee__group" aria-hidden>
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OfferSection({ onSelectCategory }) {
  const handleShop = () => {
    onSelectCategory?.('all');
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <section className="offer-section" aria-label="Trendkaari fashion sale">
      <OfferMarquee />
      <div className="offer-section__vignette" aria-hidden />

      <div className="offer-section__inner">
        <div className="offer-section__visuals">
          {POLAROIDS.map((card) => (
            <figure
              key={card.id}
              className={`offer-polaroid ${card.className}`}
              style={{ '--polaroid-rotate': `${card.rotate}deg` }}
            >
              <div className="offer-polaroid__frame">
                <img
                  src={card.image}
                  alt={card.label}
                  className="offer-polaroid__img"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = '1';
                    const fallbacks = {
                      her: '/banners/promo-women-western.png',
                      him: '/banners/promo-men-modern.png',
                      couple: '/banners/promo-couple-luxe.png',
                    };
                    e.currentTarget.src = fallbacks[card.id] || '/combos/combo-teal-patola-couple.png';
                  }}
                />
                <span className="offer-polaroid__label">{card.label}</span>
              </div>
              <figcaption className="offer-polaroid__caption">{card.caption}</figcaption>
            </figure>
          ))}
        </div>

        <div className="offer-section__copy">
          <p className="offer-section__brand">Trendkaari</p>
          <p className="offer-section__eyebrow">Limited time · Shop the edit</p>

          <div className="offer-section__headline">
            <span className="offer-section__watermark" aria-hidden>
              SALE
            </span>
            <h2 className="offer-section__title">
              <span className="offer-section__title-script">Fashion</span>
              <span className="offer-section__title-bold">Sale</span>
            </h2>
          </div>

          <p className="offer-section__discount">
            Discount up to <strong>50%</strong> on ethnic &amp; contemporary wear
          </p>

          <ul className="offer-section__pills">
            {OFFER_PILLS.map(({ icon: Icon, text }) => (
              <li key={text} className="offer-section__pill">
                <Icon size={15} strokeWidth={1.75} aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <button type="button" className="offer-section__cta" onClick={handleShop}>
            Shop Now
          </button>

          <p className="offer-section__fine">*Offers apply on selected styles. T&amp;C apply.</p>
        </div>
      </div>
    </section>
  );
}
