import React, { useState } from 'react';
import { X, Star, ShoppingBag, Plus, Minus, Heart, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import './QuickViewModal.css';
import ProductDiscountChip from './ProductDiscountChip';
import StoreCouponsPromo from './StoreCouponsPromo';
import ProductImage from './ProductImage';
import { getProductGalleryImages, getProductPrimaryImage } from '../utils/productImages';

export default function QuickViewModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
  allProducts = [], 
  onSelectProduct,
  coupons = [],
}) {
  if (!isOpen || !product) return null;

  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToBag = () => {
    onAddToCart(product, selectedSize, quantity);
    onClose();
  };

  // Smooth scroll back to top of the info details and change the active product in the modal
  const handleSelectSuggested = (newProduct) => {
    onSelectProduct(newProduct);
    setSelectedSize(newProduct.sizes ? newProduct.sizes[0] : '');
    setQuantity(1);
    setActiveImageIndex(0);
    
    // Scroll the details section back to the top smoothly
    const scrollContainer = document.querySelector('.quickview-info-col-new');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate dynamic specs based on product details for the Libas feel
  const getColor = () => {
    const title = product.title.toLowerCase();
    if (title.includes('magenta')) return 'Magenta / Wine';
    if (title.includes('sage') || title.includes('olive') || title.includes('green')) return 'Sage Green / Olive';
    if (title.includes('blue')) return 'Midnight Blue / Teal';
    if (title.includes('ivory') || title.includes('white')) return 'Ivory White';
    if (title.includes('orange') || title.includes('rust')) return 'Rust Orange';
    if (title.includes('peach')) return 'Peach / Coral';
    if (title.includes('lavender') || title.includes('purple')) return 'Lavender / Purple';
    return 'Multicolor';
  };

  const getFabric = () => {
    const title = product.title.toLowerCase();
    if (title.includes('silk')) return 'Silk Blend';
    if (title.includes('cotton')) return '100% Pure Cotton';
    if (title.includes('linen')) return 'Premium Linen';
    if (title.includes('velvet')) return 'Opulent Velvet';
    return 'Viscose Rayon';
  };

  const getShape = () => {
    const title = product.title.toLowerCase();
    if (title.includes('anarkali')) return 'Anarkali / Flared';
    if (title.includes('saree')) return 'Saree / 5.5 Metres';
    if (title.includes('co-ord') || title.includes('pyjama')) return 'Tunic & Trouser Set';
    return 'Straight Fit';
  };

  const getPattern = () => {
    const title = product.title.toLowerCase();
    if (title.includes('embroidered')) return 'Intricate Yoke Embroidery';
    if (title.includes('printed')) return 'Botanical Block Print';
    return 'Woven Ethnic Motifs';
  };

  const getSleeve = () => {
    const title = product.title.toLowerCase();
    if (title.includes('saree')) return 'Sleeveless / Comes with Blouse Piece';
    return 'Three-Quarter (3/4) Sleeves';
  };

  // Use the actual list of unzipped images inside the product directory
  const pImages = getProductGalleryImages(product);

  // Filter similar items (prioritize same category, excluding active product)
  const categorySuggestions = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  const otherSuggestions = allProducts.filter(p => p.category !== product.category && p.id !== product.id);
  const suggestions = [...categorySuggestions, ...otherSuggestions].slice(0, 4);

  return (
    <div className="quickview-overlay-wrapper active">
      <div className="quickview-modal-backdrop" onClick={onClose}></div>
      
      <div className="quickview-modal-container vip-design">
        {/* Close Button */}
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close Modal">
          <X size={20} />
        </button>

        {/* Modal content body */}
        <div className="quickview-modal-body">
          
          {/* Left Column: Premium Multi-view Gallery */}
          <div className="quickview-media-col-new">
            {/* Sidebar of Thumbnails */}
            <div className="gallery-thumbnails-col">
              {pImages.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  className={`thumb-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <div className="thumb-crop-container">
                    <img 
                      src={imgUrl} 
                      alt={`${product.title} view ${idx + 1}`}
                      style={{ objectFit: 'cover' }}
                      className="thumb-img"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Main Featured Photo Box */}
            <div className="gallery-main-display">
              <span className="quickview-discount-tag-new">{product.discount || "SPECIAL DEAL"}</span>
              <div className="main-image-zoom-box">
                <ProductImage
                  product={product}
                  src={pImages[activeImageIndex] || getProductPrimaryImage(product)}
                  images={pImages}
                  alt={product.title}
                  className="main-view-img"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Product Specs like Libas website */}
          <div className="quickview-info-col-new">
            
            {/* Breadcrumb / Category */}
            <div className="breadcrumb-strip">
              <span className="bread-link">Home</span>
              <span className="bread-sep">/</span>
              <span className="bread-link">{product.category}</span>
              <span className="bread-sep">/</span>
              <span className="bread-current">{product.title.split(' ').slice(0, 3).join(' ')}...</span>
            </div>

            <h2 className="quickview-title-new">{product.title}</h2>
            <p className="sku-code-label">SKU: LIB-{(product.id * 8934).toString(16).toUpperCase()}</p>

            {/* Ratings and Reviews */}
            <div className="quickview-rating-row-new">
              <div className="stars-pill">
                <span className="rating-num-bold">{product.rating}</span>
                <Star size={13} fill="#600b45" stroke="#600b45" />
              </div>
              <span className="divider-line">|</span>
              <span className="quickview-reviews-count-new">{product.reviewsCount} Verified Customer Reviews</span>
            </div>

            {/* Pricing Section with red/plum percentage and line-through */}
            <div className="quickview-price-row-new">
              <div className="price-values">
                <span className="price-curr">₹{product.price}</span>
                <span className="price-orig">MRP ₹{product.originalPrice}</span>
              </div>
              <span className="discount-percentage-badge">
                ({product.discount || "50% OFF"})
              </span>
            </div>
            
            <p className="inclusive-taxes-tag">inclusive of all taxes</p>

            <StoreCouponsPromo
              coupons={coupons}
              className="exclusive-promos-box"
              headerClassName="promo-box-title"
              listClassName="promo-offers-list"
              dotClassName="promo-bullet"
            />

            {/* Sizing Selector Section */}
            <div className="quickview-size-selector-section-new">
              <div className="size-label-row-new">
                <span className="quickview-label-new">SELECT SIZE:</span>
                <button className="size-chart-link-btn" onClick={() => alert("📏 SIZE CHART & MEASUREMENTS\n\nStandard Indian sizes (in inches):\nXS: Chest 34, Waist 28\nS: Chest 36, Waist 30\nM: Chest 38, Waist 32\nL: Chest 40, Waist 34\nXL: Chest 42, Waist 36\nXXL: Chest 44, Waist 38")}>
                  SIZE CHART
                </button>
              </div>
              <div className="quickview-sizes-row-new">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    className={`quickview-size-btn-new ${selectedSize === sz ? 'active' : ''}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector Section */}
            <div className="quickview-qty-section-new">
              <span className="quickview-label-new">QUANTITY:</span>
              <div className="qty-counter-row-new">
                <button className="qty-counter-btn-new" onClick={decrementQty}>
                  <Minus size={13} />
                </button>
                <span className="qty-count-display-new">{quantity}</span>
                <button className="qty-counter-btn-new" onClick={incrementQty}>
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Primary Action Buttons: Add To Bag and Wishlist side by side */}
            <div className="action-buttons-row">
              <button className="btn btn-primary add-to-bag-cta" onClick={handleAddToBag}>
                <ShoppingBag size={16} className="btn-icon" />
                ADD TO BAG
              </button>
              <button
                type="button"
                className={`btn btn-outline-plum wishlist-cta ${isInWishlist ? 'saved' : ''}`}
                onClick={() => onAddToWishlist?.(product, selectedSize)}
              >
                <Heart size={16} className="btn-icon" fill={isInWishlist ? 'currentColor' : 'none'} />
                {isInWishlist ? 'SAVED' : 'WISHLIST'}
              </button>
            </div>

            {/* Product Specifications & Care dynamic grid */}
            <div className="product-specifications-section">
              <h4 className="spec-heading">PRODUCT SPECIFICATIONS</h4>
              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-name">Fabric</span>
                  <span className="spec-value">{getFabric()}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Color</span>
                  <span className="spec-value">{getColor()}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Shape</span>
                  <span className="spec-value">{getShape()}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Pattern</span>
                  <span className="spec-value">{getPattern()}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Sleeve Length</span>
                  <span className="spec-value">{getSleeve()}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-name">Washing Care</span>
                  <span className="spec-value">Hand Wash, Cold Water</span>
                </div>
              </div>
            </div>

            {/* Product description tab content */}
            <div className="quickview-desc-tab-box">
              <h4 className="spec-heading">PRODUCT DESCRIPTION</h4>
              <p className="product-desc-paragraph">{product.description}</p>
              <p className="product-desc-model-height">The model (height 170 cm) is wearing a size S.</p>
            </div>

            {/* Suggestions / You May Also Like Section */}
            {suggestions.length > 0 && (
              <div className="quickview-suggestions-section-new">
                <h4 className="spec-heading">YOU MAY ALSO LIKE</h4>
                <div className="suggestions-grid-new">
                  {suggestions.map((item) => (
                    <div 
                      key={item.id} 
                      className="suggested-card-new"
                      onClick={() => handleSelectSuggested(item)}
                    >
                      <div className="suggested-img-container">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="suggested-img" 
                        />
                      </div>
                      <div className="suggested-info-box">
                        <h5 className="suggested-title-text">{item.title}</h5>
                        <div className="suggested-price-row">
                          <span className="suggested-price-curr">₹{item.price}</span>
                          <ProductDiscountChip product={item} className="product-discount-chip--compact" />
                          <span className="suggested-price-orig">₹{item.originalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust and Delivery Strip Badges */}
            <div className="trust-strip-badges">
              <div className="trust-badge-item">
                <Truck size={16} className="trust-icon" />
                <div className="trust-text">
                  <span className="trust-bold">Express Shipping</span>
                  <span className="trust-sub">Fast dispatch in 24 hrs</span>
                </div>
              </div>
              <div className="trust-badge-item">
                <RefreshCw size={16} className="trust-icon" />
                <div className="trust-text">
                  <span className="trust-bold">Easy Returns</span>
                  <span className="trust-sub">7 Days Policy</span>
                </div>
              </div>
              <div className="trust-badge-item">
                <ShieldCheck size={16} className="trust-icon" />
                <div className="trust-text">
                  <span className="trust-bold">100% Original</span>
                  <span className="trust-sub">Direct from Brand</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
