/** Sale price filters — catalog uses ₹99, ₹129, ₹139, ₹149 only. */

export const PRICE_FILTER_MIN = 99;
export const PRICE_FILTER_MAX = 149;

export const PRICE_FILTER_OPTIONS = [
  { val: '99', label: '₹99' },
  { val: '129', label: '₹129' },
  { val: '139', label: '₹139' },
  { val: '149', label: '₹149' },
];

export function matchesPriceFilter(price, rangeKey) {
  const p = Number(price);
  if (Number.isNaN(p)) return false;

  switch (rangeKey) {
    case '99':
      return p === 99;
    case '129':
      return p === 129;
    case '139':
      return p === 139;
    case '149':
      return p === 149;
    default:
      return false;
  }
}
