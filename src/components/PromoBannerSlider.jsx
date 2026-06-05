import React, { useCallback, useEffect, useState } from 'react';
import './PromoBannerSlider.css';

/** Fallback when no admin ad slots */
const DEFAULT_SLIDES = [
  {
    id: 'banner-women-western',
    image: '/banners/promo-women-western.png',
    title: 'Contemporary Chic',
    subtitle: 'Luxe Co-ords & Western Silhouettes',
    highlight: 'New Collection',
    alt: 'Premium Western Wear — Contemporary Chic',
  },
  {
    id: 'banner-men-modern',
    image: '/banners/promo-men-modern.png',
    title: 'The Power Look',
    subtitle: 'Structured Blazers & Modern Essentials',
    highlight: 'Sharp & Sophisticated',
    alt: 'Modern Men — Sharp Blazers',
  },
  {
    id: 'banner-couple-luxe',
    image: '/banners/promo-couple-luxe.png',
    title: 'The Power Couple',
    subtitle: 'Coordinated Luxury for Every Celebration',
    highlight: 'Festive Combos',
    alt: 'Luxury Couple Match — Festive Outfits',
  },
];

export default function PromoBannerSlider({ onSelectCategory }) {
  const slides = DEFAULT_SLIDES;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const showDots = total > 1;

  const goTo = useCallback(
    (index) => {
      setActive(((index % total) + total) % total);
    },
    [total],
  );

  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    setActive(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || total < 2) return undefined;
    const id = setInterval(goNext, 5000);
    return () => clearInterval(id);
  }, [paused, goNext, total]);

  const handleShopClick = (e) => {
    e.stopPropagation();
    onSelectCategory?.('all');
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleSlideClick = () => {
    onSelectCategory?.('all');
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <section className="promo-banner-section" aria-label="Promotional offers">
      <div
        className="promo-banner-slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="promo-banner-slider__viewport">
          <div
            className="promo-banner-slider__track"
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className="promo-banner-slider__slide"
                onClick={handleSlideClick}
              >
                <div className="promo-banner-slider__content-wrapper">
                  <div className="promo-banner-slider__cluster">
                    <div className="promo-banner-slider__text-side">
                      <span className="promo-banner-slider__badge">{slide.highlight}</span>
                      <h2 className="promo-banner-slider__title">{slide.title}</h2>
                      <p className="promo-banner-slider__subtitle">{slide.subtitle}</p>
                      <button type="button" className="promo-banner-slider__cta" onClick={handleShopClick}>
                        Shop Collection
                      </button>
                    </div>
                    <div className="promo-banner-slider__image-side">
                      <div className="promo-banner-slider__arch-frame">
                        <img
                          src={slide.image}
                          alt={slide.alt}
                          className="promo-banner-slider__img"
                          loading={i === 0 ? 'eager' : 'lazy'}
                          fetchPriority={i === 0 ? 'high' : 'auto'}
                          decoding="async"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showDots ? (
            <div className="promo-banner-slider__dots" role="tablist" aria-label="Banner slides">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`promo-banner-slider__dot ${active === i ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
