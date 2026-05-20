import React from 'react';
import './StoreSection.css';

const storesData = [
  {
    id: 1,
    name: "LAJPAT NAGAR, DELHI",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    address: "Block D, Lajpat Nagar II, New Delhi"
  },
  {
    id: 2,
    name: "KAROL BAGH, DELHI",
    image: "https://images.unsplash.com/photo-1441984969893-c53b1796834b?auto=format&fit=crop&w=800&q=80",
    address: "Ajmal Khan Road, Karol Bagh, New Delhi"
  },
  {
    id: 3,
    name: "HSR LAYOUT, BANGALORE",
    image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
    address: "17th Cross, Sector 7, HSR Layout, Bengaluru"
  },
  {
    id: 4,
    name: "SECTOR 50, NOIDA",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80",
    address: "Central Market, Sector 50, Noida"
  }
];

export default function StoreSection() {
  return (
    <section className="stores-section-wrapper section-padding">
      <div className="container">
        
        <div className="section-heading-container">
          <h2 className="section-title">VISIT OUR STORES</h2>
        </div>

        {/* Stores Grid Layout */}
        <div className="stores-cards-grid">
          {storesData.map((store) => (
            <div key={store.id} className="store-card hover-zoom-container">
              <img 
                src={store.image} 
                alt={store.name} 
                className="store-card-img hover-zoom-img" 
              />
              <div className="store-card-overlay">
                <div className="store-overlay-text-box">
                  <h4 className="store-card-name">{store.name}</h4>
                  <p className="store-card-address">{store.address}</p>
                  <button className="btn btn-outline-white store-visit-btn">
                    VISIT STORE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Stores Button */}
        <div className="stores-view-all-box">
          <button className="btn btn-outline-dark view-all-stores-btn">
            VIEW ALL STORES
          </button>
        </div>

      </div>
    </section>
  );
}
