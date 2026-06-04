/** Resolve ad HTML for a placement — optional fallbacks when that exact slot is empty. */

const GLOBAL_FALLBACKS = ['site_common_ad', 'global_banner'];

/** Per-slot fallback chain (first match with saved code wins). Sibling slots only — no duplicate globals. */
export const AD_SLOT_FALLBACKS = {
  category_top: ['category_after_banner'],
  category_after_quick_tabs: ['category_before_quick_tabs', 'category_after_banner'],
  category_sidebar_top: ['category_sidebar_middle', 'category_after_banner'],
  category_sidebar_bottom: ['category_sidebar_middle', 'category_below_sort'],
  category_above_sort: ['category_below_sort', 'category_after_banner'],

  home_main: ['home_after_trends'],
  home_after_promo: ['home_before_categories', 'home_after_trends'],
  home_between_categories_gift: ['home_after_categories', 'home_after_gift'],
  home_before_gift: ['home_after_categories', 'home_after_gift'],
  home_before_reviews: ['home_after_reviews', 'home_after_gift'],

  product_after_title: ['product_top'],
  product_after_rating: ['product_top'],
  product_after_price: ['product_above_cart', 'product_top'],
  product_after_offers: ['product_above_cart', 'product_top'],
  product_before_size: ['product_above_cart', 'product_top'],
  product_after_size: ['product_above_cart', 'product_top'],
  product_below_cart: ['product_above_cart', 'product_top'],
  product_after_details: ['product_before_details', 'product_top'],
  product_before_trust: ['product_before_details', 'product_above_cart'],
  product_after_trust: ['product_before_details', 'product_above_cart'],
  product_after_suggestions: ['product_before_suggestions', 'product_page_bottom'],

  checkout_all_steps_top: ['checkout_step_bag_top'],
  checkout_all_steps_bottom: ['checkout_step_bag_bottom'],
  checkout_step_error_bottom: ['checkout_step_error_top', 'checkout_step_bag_bottom'],
  checkout_empty_cart: ['checkout_step_bag_top'],
  cart_above_checkout: ['site_common_ad'],
};

export function resolveAdCode(adCodes, primaryKey, extraFallbacks = [], { allowGlobal = false } = {}) {
  const checkoutFallbacks = primaryKey.startsWith('checkout_step_')
    ? primaryKey.endsWith('_top')
      ? ['checkout_all_steps_top', 'checkout_step_bag_top']
      : primaryKey.endsWith('_bottom')
        ? ['checkout_all_steps_bottom', 'checkout_step_bag_bottom']
        : []
    : [];

  const chain = [
    primaryKey,
    ...extraFallbacks,
    ...checkoutFallbacks,
    ...(AD_SLOT_FALLBACKS[primaryKey] || []),
    ...(allowGlobal ? GLOBAL_FALLBACKS : []),
  ];

  const seen = new Set();
  for (const key of chain) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const code = adCodes?.[key];
    if (String(code || '').trim()) {
      return { code, label: primaryKey, resolvedFrom: key };
    }
  }

  return { code: '', label: primaryKey, resolvedFrom: null };
}

export function getAdCode(adCodes, primaryKey, extraFallbacks = [], options = {}) {
  return resolveAdCode(adCodes, primaryKey, extraFallbacks, options).code;
}

export function makeAdResolver(adCodes, options = {}) {
  return (primaryKey, ...extraFallbacks) =>
    getAdCode(adCodes, primaryKey, extraFallbacks, options);
}
