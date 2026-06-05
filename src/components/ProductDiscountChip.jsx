import { getProductDiscountPercent } from '../utils/productDiscount';
import './ProductDiscountChip.css';

/** Inline discount badge for price rows — not overlaid on product photos. */
export default function ProductDiscountChip({ product, className = '' }) {
  const percent = getProductDiscountPercent(product);
  if (!percent) return null;

  return (
    <span className={`product-discount-chip ${className}`.trim()} aria-label={`${percent} percent off`}>
      <span className="product-discount-chip__pct">{percent}%</span>
      <span className="product-discount-chip__lbl">off</span>
    </span>
  );
}
