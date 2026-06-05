import React from 'react';
import { Eye } from 'lucide-react';
import ProductImage from './ProductImage';
import ProductDiscountChip from './ProductDiscountChip';
import { getNewArrivalProducts } from '../utils/catalogSync';
import { getProductPrimaryImage, getProductGalleryImages } from '../utils/productImages';
import './CollectionListingPage.css';
import './NewArrivalsSection.css';

export default function NewArrivalsSection({
  products = [],
  onOpenQuickView,
  onViewAll,
}) {
  const items = getNewArrivalProducts(products, 12);
  if (!items.length) return null;

  return (
    <section className="new-arrivals-section section-padding" id="catalog-products-list">
      <div className="container">
        <div className="new-arrivals-section__head">
          <div>
            <p className="new-arrivals-section__eyebrow">Just added</p>
            <h2 className="section-title">NEW ARRIVALS</h2>
          </div>
          <button
            type="button"
            className="btn btn-outline new-arrivals-section__view-all"
            onClick={() => onViewAll?.()}
          >
            View all products
          </button>
        </div>

        <div className="collection-products-grid new-arrivals-section__grid">
          {items.map((product) => {
            const gallery = getProductGalleryImages(product);
            const primaryImage = getProductPrimaryImage(product);

            return (
              <div key={product.id} className="collection-item-card hover-zoom-container">
                <div
                  className="card-media-viewport"
                  onClick={() => onOpenQuickView?.(product)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onOpenQuickView?.(product);
                  }}
                >
                  <ProductImage
                    product={product}
                    src={primaryImage}
                    images={gallery}
                    alt={product.title}
                    className="card-img-element main-photo"
                  />
                  <button
                    type="button"
                    className="card-quickview-overlay-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenQuickView?.(product);
                    }}
                  >
                    <Eye size={14} />
                    <span>QUICK VIEW</span>
                  </button>
                </div>

                <div className="card-details-info">
                  <h3
                    className="card-product-title"
                    onClick={() => onOpenQuickView?.(product)}
                  >
                    {product.title}
                  </h3>
                  <div className="card-pricing-row">
                    <span className="price-curr">₹{product.price}</span>
                    <ProductDiscountChip product={product} />
                    {product.originalPrice > product.price && (
                      <span className="price-orig">₹{product.originalPrice}</span>
                    )}
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
