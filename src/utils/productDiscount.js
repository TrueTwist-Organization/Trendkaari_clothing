/** Parse "50% OFF" or compute from MRP vs sale price. */
export function getProductDiscountPercent(product) {
  const label = product?.discount;
  if (label) {
    const match = String(label).match(/(\d+)/);
    if (match) return Number(match[1]);
  }
  const original = Number(product?.originalPrice);
  const price = Number(product?.price);
  if (original > price && original > 0) {
    return Math.round(((original - price) / original) * 100);
  }
  return 0;
}

export function getProductSavings(product) {
  const original = Number(product?.originalPrice);
  const price = Number(product?.price);
  if (original > price) return original - price;
  return 0;
}
