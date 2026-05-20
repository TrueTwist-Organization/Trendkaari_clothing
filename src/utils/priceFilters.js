/** Sale price filters — catalog uses ₹99, ₹149, ₹199, ₹249 only. */

export const PRICE_FILTER_MIN = 99;
export const PRICE_FILTER_MAX = 249;

export const PRICE_FILTER_OPTIONS = [
  { val: '99', label: '₹99' },
  { val: '149', label: '₹149' },
  { val: '199', label: '₹199' },
  { val: '249', label: '₹249' },
];

export function matchesPriceFilter(price, rangeKey) {
  const p = Number(price);
  if (Number.isNaN(p)) return false;

  switch (rangeKey) {
    case '99':
      return p === 99;
    case '149':
      return p === 149;
    case '199':
      return p === 199;
    case '249':
      return p === 249;
    default:
      return false;
  }
}
