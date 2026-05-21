import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, Plus, Minus, Heart, Truck, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { getProductDetailContent, getSizeChartForProduct } from '../utils/productContent';
import ProductDetailsAmazon from './ProductDetailsAmazon';
import './ProductDetailPage.css';
import ProductDiscountChip from './ProductDiscountChip';
import PageBackButton from './PageBackButton';
import StoreCouponsPromo from './StoreCouponsPromo';
import PageAdSlot from './PageAdSlot';

export default function ProductDetailPage({ 
  product, 
  onBack,
  onBackToHome, 
  onAddToCart,
  onAddToWishlist,
  isInWishlist = false,
  allProducts = [], 
  onSelectProduct,
  coupons = [],
  adCodes = {},
}) {
  const ad = (key) => adCodes[key] || '';
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);

  const detailContent = getProductDetailContent(product);
  const sizeChart = getSizeChartForProduct(product);

  // Scroll to top when a product loads in full page mode
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    document.body.classList.add('pdp-page');
    return () => document.body.classList.remove('pdp-page');
  }, []);

  const incrementQty = () => setQuantity(prev => prev + 1);
  const decrementQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToBag = () => {
    onAddToCart(product, selectedSize, quantity);
  };

  const handleSelectSuggested = (newProduct) => {
    onSelectProduct(newProduct);
    setSelectedSize(newProduct.sizes ? newProduct.sizes[0] : '');
    setQuantity(1);
    setActiveImageIndex(0);
    window.scrollTo(0, 0);
  };

  // Use the actual list of unzipped images inside the product directory
  const pImages = product.images && product.images.length > 0 ? product.images : [product.image];

  // Filter similar items (prioritize same category, excluding active product)
  const categorySuggestions = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  const otherSuggestions = allProducts.filter(p => p.category !== product.category && p.id !== product.id);
  const suggestions = [...categorySuggestions, ...otherSuggestions].slice(0, 4);

  return (
    <div className="product-detail-page-container container">
      
      <nav className="pdp-top-nav" aria-label="Product navigation">
        <PageBackButton
          onClick={onBack || onBackToHome}
          className="page-back-btn--minimal"
        />
        <div className="pdp-breadcrumb">
          <span className="pdp-bread-link" onClick={onBackToHome}>Home</span>
          <span className="pdp-bread-sep">›</span>
          <span className="pdp-bread-link" onClick={onBackToHome}>{product.category}</span>
          <span className="pdp-bread-sep">›</span>
          <span className="pdp-bread-current">{product.title}</span>
        </div>
      </nav>

      <PageAdSlot code={ad('product_top')} label="product_top" variant="pdp" />

      <div className="pdp-main-layout product-layout">
        
        {/* LEFT — sticky gallery (page scroll only) */}
        <div className="pdp-gallery-col left-image-section">
          {/* Vertical Thumbnails List */}
          <div className="pdp-thumbnails-list">
            {pImages.map((imgUrl, idx) => (
              <div 
                key={idx}
                className={`pdp-thumb-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <div className="pdp-thumb-crop">
                  <img 
                    src={imgUrl} 
                    alt={`${product.title} view ${idx + 1}`}
                    className="pdp-thumb-img"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Main Large Display View */}
          <div className="pdp-main-display">
            <span className="pdp-discount-tag-label">{product.discount || "SPECIAL OFFER"}</span>
            <div className="pdp-main-image-viewport">
              <img 
                src={pImages[activeImageIndex] || product.image} 
                alt={product.title} 
                className="pdp-main-img" 
              />
            </div>
          </div>

          <PageAdSlot
            code={ad('product_gallery_bottom')}
            label="product_gallery_bottom"
            variant="pdp-gallery"
          />
        </div>


        {/* RIGHT — product info (page scroll only) */}
        <div className="pdp-details-col right-info-section">
          <div className="pdp-details-buy">
          <h1 className="pdp-title">{product.title}</h1>
          {product.isGiftCombo ? (
            <div className="pdp-combo-meta">
              <span className="pdp-combo-badge">{product.comboBadge || 'Gift combo'}</span>
              {product.comboIncludes ? (
                <p className="pdp-combo-includes">Includes: {product.comboIncludes}</p>
              ) : null}
            </div>
          ) : null}
          <p className="pdp-sku-label">SKU: LIB-{(product.id * 8934).toString(16).toUpperCase()}</p>

          <PageAdSlot code={ad('product_after_title')} label="product_after_title" variant="pdp" />

          {/* Ratings Summary */}
          <div className="pdp-ratings-row">
            <div className="pdp-stars-pill">
              <span className="pdp-rating-val">{product.rating}</span>
              <Star size={13} fill="#600b45" stroke="#600b45" />
            </div>
            <span className="pdp-ratings-divider">|</span>
            <span className="pdp-ratings-count">{product.reviewsCount} Verified Customer Reviews</span>
          </div>

          <PageAdSlot code={ad('product_after_rating')} label="product_after_rating" variant="pdp" />

          {/* Pricing Box */}
          <div className="pdp-pricing-box">
            <div className="pdp-price-tag-row">
              <span className="pdp-price-current">₹{product.price}</span>
              <span className="pdp-price-original">MRP ₹{product.originalPrice}</span>
            </div>
            <span className="pdp-discount-percentage">
              ({product.discount || "50% OFF"})
            </span>
          </div>
          <p className="pdp-inclusive-taxes">inclusive of all taxes</p>

          <PageAdSlot code={ad('product_after_price')} label="product_after_price" variant="pdp" />

          <StoreCouponsPromo coupons={coupons} />

          <PageAdSlot code={ad('product_after_offers')} label="product_after_offers" variant="pdp" />

          <PageAdSlot code={ad('product_before_size')} label="product_before_size" variant="pdp" />

          {/* Sizing Selector Section */}
          <div className="pdp-size-selector-section">
            <div className="pdp-size-header-row">
              <span className="pdp-section-label">SELECT SIZE:</span>
              <button type="button" className="pdp-size-chart-btn" onClick={() => setShowSizeChart(true)}>
                SIZE CHART
              </button>
            </div>
            <div className="pdp-sizes-row">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  className={`pdp-size-opt-btn ${selectedSize === sz ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <PageAdSlot code={ad('product_after_size')} label="product_after_size" variant="pdp" />

          <PageAdSlot code={ad('product_above_cart')} label="product_above_cart" variant="pdp" />

          {/* Quantity Selector Section */}
          <div className="pdp-qty-section">
            <span className="pdp-section-label">QUANTITY:</span>
            <div className="pdp-qty-counter">
              <button className="pdp-qty-btn" onClick={decrementQty}>
                <Minus size={13} />
              </button>
              <span className="pdp-qty-display">{quantity}</span>
              <button className="pdp-qty-btn" onClick={incrementQty}>
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="pdp-actions-row">
            <button className="btn btn-primary pdp-add-to-bag-btn" onClick={handleAddToBag}>
              <ShoppingBag size={16} className="pdp-btn-icon" />
              ADD TO BAG
            </button>
            <button 
              type="button"
              className={`btn btn-outline-plum pdp-wishlist-btn ${isInWishlist ? 'saved' : ''}`}
              onClick={() => onAddToWishlist?.(product, selectedSize)}
            >
              <Heart size={16} className="pdp-btn-icon" fill={isInWishlist ? 'currentColor' : 'none'} />
              {isInWishlist ? 'SAVED' : 'WISHLIST'}
            </button>
          </div>

          <PageAdSlot code={ad('product_below_cart')} label="product_below_cart" variant="pdp" />
          </div>

          <div className="pdp-details-scroll">
          <PageAdSlot code={ad('product_before_details')} label="product_before_details" variant="pdp" />

          <ProductDetailsAmazon product={product} />

          <PageAdSlot code={ad('product_after_details')} label="product_after_details" variant="pdp" />

          <PageAdSlot code={ad('product_before_trust')} label="product_before_trust" variant="pdp" />

                    {/* Trust strip details */}
          <div className="pdp-trust-strip">
            <div className="pdp-trust-item">
              <Truck size={16} className="pdp-trust-icon" />
              <div className="pdp-trust-text-box">
                <span className="pdp-trust-title-bold">Express Shipping</span>
                <span className="pdp-trust-subtitle-small">Fast dispatch in 24 hrs</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <RefreshCw size={16} className="pdp-trust-icon" />
              <div className="pdp-trust-text-box">
                <span className="pdp-trust-title-bold">Easy Returns</span>
                <span className="pdp-trust-subtitle-small">7 Days Policy</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <ShieldCheck size={16} className="pdp-trust-icon" />
              <div className="pdp-trust-text-box">
                <span className="pdp-trust-title-bold">100% Original</span>
                <span className="pdp-trust-subtitle-small">Direct from Brand</span>
              </div>
            </div>
          </div>

          <PageAdSlot code={ad('product_after_trust')} label="product_after_trust" variant="pdp" />

                {suggestions.length > 0 && (
        <div className="pdp-suggestions-section pdp-suggestions-in-col">
          <PageAdSlot
            code={ad('product_before_suggestions')}
            label="product_before_suggestions"
            variant="pdp"
          />
          <div className="pdp-suggestions-header-box">
            <h3 className="pdp-suggestions-title">YOU MAY ALSO LIKE</h3>
            <div className="pdp-suggestions-bar-decor"></div>
          </div>
          <div className="pdp-suggestions-grid">
            {suggestions.map((item, index) => {
              const showSugAd =
                ad('product_suggestions_every_2') &&
                (index + 1) % 2 === 0 &&
                index < suggestions.length - 1;

              return (
              <React.Fragment key={item.id}>
              <div 
                className="pdp-suggested-card hover-zoom-container"
                onClick={() => handleSelectSuggested(item)}
              >
                <div className="pdp-suggested-img-box">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="pdp-suggested-img hover-zoom-img" 
                  />
                </div>
                <div className="pdp-suggested-info">
                  <h4 className="pdp-suggested-product-title">{item.title}</h4>
                  <div className="pdp-suggested-price-row">
                    <span className="pdp-suggested-price-curr">₹{item.price}</span>
                    <ProductDiscountChip product={item} className="product-discount-chip--compact" />
                    <span className="pdp-suggested-price-orig">₹{item.originalPrice}</span>
                  </div>
                </div>
              </div>
              {showSugAd && (
                <PageAdSlot
                  code={ad('product_suggestions_every_2')}
                  label="product_suggestions_every_2"
                  variant="pdp-suggestions-full"
                />
              )}
              </React.Fragment>
            );
            })}
          </div>
          <PageAdSlot
            code={ad('product_after_suggestions')}
            label="product_after_suggestions"
            variant="pdp"
          />
        </div>
      )}

          </div>

        </div>

      </div>

      {showSizeChart && (
        <div className="pdp-size-chart-modal" role="dialog" aria-modal="true">
          <div className="pdp-size-chart-backdrop" onClick={() => setShowSizeChart(false)} />
          <div className="pdp-size-chart-panel">
            <div className="pdp-size-chart-head">
              <h3>Size Chart (inches)</h3>
              <button type="button" onClick={() => setShowSizeChart(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="pdp-size-chart-table-wrap">
              <table className="pdp-size-chart-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    {detailContent?.sizeChartType === 'mens' ? (
                      <>
                        <th>Shoulder</th>
                        <th>Length</th>
                        <th>Sleeve</th>
                      </>
                    ) : (
                      <>
                        <th>Shoulder</th>
                        <th>Length</th>
                        <th>Sleeve</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sizeChart.map((row) => (
                    <tr key={row.size}>
                      <td><strong>{row.size}</strong></td>
                      <td>{row.chest}</td>
                      <td>{row.shoulder}</td>
                      <td>{row.length}</td>
                      <td>{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="pdp-size-chart-note">Measurements are approximate. For the best fit, compare with a similar garment you own.</p>
          </div>
        </div>
      )}

      <PageAdSlot code={ad('product_page_bottom')} label="product_page_bottom" variant="section" />
    </div>
  );
}
