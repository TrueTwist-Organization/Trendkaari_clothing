import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import './TrendsSection.css';

const trendsData = [
  {
    id: 1,
    title: "MEN'S CO-ORDS",
    subTitle: "RESORT MATCHING SETS",
    image: "/mens/coords/co-ordset men/co2/1.webp",
    category: "gents co-ords"
  },
  {
    id: 2,
    title: "ELEGANT BLAZERS",
    subTitle: "TAILORED CLASSICS",
    image: "/mens/blazers/Blezermen/b10/1.webp",
    category: "blazers"
  },
  {
    id: 3,
    title: "SAGE SATIN TOPS",
    subTitle: "LUXURY RUFFLED SILK",
    image: "/tops/1/1.webp",
    category: "tops"
  },
  {
    id: 4,
    title: "FLORAL GEORGETTE",
    subTitle: "PUFF SLEEVE STATEMENT",
    image: "/tops/4/1.webp",
    category: "tops"
  },
  {
    id: 5,
    title: "LAVENDER CAMIS",
    subTitle: "LACE CAMISOLE TOP",
    image: "/tops/7/1.webp",
    category: "tops"
  },
  {
    id: 6,
    title: "UTILITY JACKETS",
    subTitle: "FIELD TRAVEL COATS",
    image: "/mens/jackets/jacketmen/j3/RFJ1105_1_e3a6abb6-e0b2-48f3-84cf-89850dd46cd5.webp",
    category: "jackets"
  }
];

export default function TrendsSection({ onSelectCategory }) {
  const [currentIndex, setCurrentIndex] = useState(2); // Start centered on Sage Satin Tops
  const [isHovered, setIsHovered] = useState(false);

  const totalItems = trendsData.length;

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + totalItems) % totalItems);
  };

  useEffect(() => {
    if (isHovered) return;

    const intervalId = setInterval(() => {
      handleNext();
    }, 3200); // Shifting every 3.2s

    return () => clearInterval(intervalId);
  }, [isHovered]);

  const handleCardClick = (category) => {
    onSelectCategory(category);
    setTimeout(() => {
      document.getElementById('catalog-products-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Helper to generate the 5 active visible slide items based on current index
  const getVisibleTrends = () => {
    const indices = [
      (currentIndex - 2 + totalItems) % totalItems,
      (currentIndex - 1 + totalItems) % totalItems,
      currentIndex,
      (currentIndex + 1) % totalItems,
      (currentIndex + 2) % totalItems
    ];
    return indices.map(idx => trendsData[idx]);
  };

  const visibleTrends = getVisibleTrends();

  return (
    <section className="trends-section-wrapper section-padding">
      <div className="container" style={{ width: '100%', maxWidth: '1450px', padding: '0 10px' }}>

        {/* Heading matching screenshot style */}
        <div className="trends-section-header">
          <h2 className="trends-header-title-clean">SHOP BY TRENDS</h2>
        </div>

        {/* Staggered Rectangular Slider Wrapper */}
        <div className="trends-carousel-outer-wrapper">
          
          {/* Left circular navigation chevron */}
          <button 
            className="carousel-nav-btn prev-btn" 
            onClick={handlePrev} 
            aria-label="Previous Slide"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>

          {/* Staggered Cards */}
          <div
            className="trends-staggered-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
          >
            {visibleTrends.map((trend, idx) => {
              const positionClass = `trend-pos-${idx + 1}`;

              return (
                <div
                  key={trend.id} // Let React re-order and slide items physically
                  className={`trend-staggered-card ${positionClass}`}
                  onClick={() => handleCardClick(trend.category)}
                >
                  <div className="trend-card-image-viewport hover-zoom-container">
                    <img
                      src={trend.image}
                      alt={trend.title}
                      className="trend-card-img hover-zoom-img"
                    />
                    
                    {/* Shop All pill button overlayed inside the image at bottom-right corner */}
                    <div className="trend-pill-btn-wrapper">
                      <button className="trend-shop-pill-btn">
                        <ShoppingBag size={13} className="bag-icon" />
                        <span>Shop All</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right circular navigation chevron */}
          <button 
            className="carousel-nav-btn next-btn" 
            onClick={handleNext} 
            aria-label="Next Slide"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>

      </div>
    </section>
  );
}
