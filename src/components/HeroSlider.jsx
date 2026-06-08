import React, { useState } from 'react';
import './HeroSlider.css';

const ARCH_IMAGE_FALLBACK = '/lehengas/Lehengas/1/040A3523_700x.webp';

/** Catalog images with strong contrast (avoid white-on-ivory looking blank) */
const archesData = [
  { id: 'tops', label: 'Western Wear', img: '/tops/4/1.webp', objectPos: 'center 22%' },
  {
    id: 'gents kurtas',
    label: "Men's Kurtas",
    img: '/mens/kurtas/kurta/1/l-pkt410-vebnor-original-imahnybzsfggj62r.webp',
    objectPos: 'center 18%',
  },
  { id: 'lehengas', label: 'Lehengas', img: '/lehengas/Lehengas/1/040A3523_700x.webp', objectPos: 'center 12%' },
  {
    id: 'shirts',
    label: 'Shirts',
    img: '/mens/shirts/shirt/shirt 8/2xl-ps-59-s-stenfia-original-imahmm36hhzp7a9q.webp',
    objectPos: 'center 15%',
  },
  { id: 'co-ords', label: 'Co-ord Sets', img: '/co-ords/co-ord_set/1/1.webp', objectPos: 'center 20%' },
];

function ArchImage({ arch }) {
  const [src, setSrc] = useState(arch.img);

  return (
    <img
      src={src}
      alt={arch.label}
      className="arch-img"
      style={{ objectPosition: arch.objectPos }}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      onError={() => {
        if (src !== ARCH_IMAGE_FALLBACK) setSrc(ARCH_IMAGE_FALLBACK);
      }}
    />
  );
}

export default function HeroSlider({ onSelectCategory }) {

  const handleArchClick = (category) => {
    onSelectCategory(category);
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <section className="hero-slider-section">
      <div className="hero-mockup-content">

        <div className="hero-copy-block">
          <h1 className="hero-headline">
            <span className="hero-headline-script">Look Good</span>
          </h1>

          <div className="hero-premium-subcopy">
            <div className="hero-premium-divider" aria-hidden="true">
              <span />
              <span className="hero-premium-divider__gem" />
              <span />
            </div>
            <p className="hero-headline-tag">Curated for every moment</p>
            <p className="hero-tagline-accent">Ethnic · Contemporary · Timeless</p>
          </div>
        </div>

        {/* Staggered cathedral arches: Static coordinates and static content */}
        <div className="hero-arches-container">
          {archesData.map((arch, idx) => {
            const positionClass = `arch-${idx + 1}`;
            
            return (
              <div
                key={arch.id}
                className={`hero-arch-card ${positionClass}`}
                onClick={() => handleArchClick(arch.id)}
              >
                <div className="arch-image-wrapper">
                  <ArchImage arch={arch} />
                  <div className="arch-overlay">
                    <span className="arch-label">{arch.label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
