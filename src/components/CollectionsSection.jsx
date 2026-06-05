import React from 'react';
import './CollectionsSection.css';

const collectionsData = [
  {
    id: 1,
    title: "GUL",
    subtitle: "In Full Bloom",
    image: "https://www.libas.in/cdn/shop/files/gul_0d5d3853-5cf5-423e-ad16-3b653eacd5c3.webp?v=1777975351",
    category: "kurtas"
  },
  {
    id: 2,
    title: "BAHAAR",
    subtitle: "Up In The Clouds",
    image: "https://www.libas.in/cdn/shop/files/bahaar_1.webp?v=1777975374",
    category: "suits"
  },
  {
    id: 3,
    title: "LIBAS ART",
    subtitle: "Signature Festive Curation",
    image: "https://www.libas.in/cdn/shop/files/libas-art_1_54f5c9e3-0203-4cfc-ac85-8bb0e1aae0f6.webp?v=1777975389",
    category: "sarees"
  },
  {
    id: 4,
    title: "EXTRA LOVE",
    subtitle: "Curvy Styles Tailored By Libas",
    image: "https://www.libas.in/cdn/shop/files/extra-love_1_f8803781-9f1c-4f79-bdb2-845eab38c5f0.webp?v=1777975401",
    category: "plus sizes"
  }
];

export default function CollectionsSection({ onSelectCategory }) {
  return (
    <section className="collections-section section-padding">
      <div className="container">
        
        <div className="section-heading-container">
          <h2 className="section-title">SHOP BY COLLECTIONS</h2>
        </div>

        <div className="collections-grid-layout">
          {collectionsData.map((col) => (
            <div 
              key={col.id} 
              className="collection-banner-card hover-zoom-container"
              onClick={() => {
                onSelectCategory(col.category);
                document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img 
                src={col.image} 
                alt={col.title} 
                className="collection-banner-img hover-zoom-img" 
              />
              <div className="collection-banner-overlay">
                <div className="collection-text-box">
                  <h3 className="collection-banner-title">{col.title}</h3>
                  <p className="collection-banner-subtitle text-uppercase letter-spacing-medium">{col.subtitle}</p>
                  <button className="btn btn-outline-white collection-banner-btn">
                    EXPLORE &gt;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
