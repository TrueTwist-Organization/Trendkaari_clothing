/** Resolve ad HTML for a placement — falls back when that exact slot is empty in admin. */

const GLOBAL_FALLBACKS = ['site_common_ad', 'global_banner'];

/** Per-slot fallback chain (first match with saved code wins). */
export const AD_SLOT_FALLBACKS = {
  // Category — saved slots: after_banner, before/after quick tabs partial, sidebar_middle, below_sort, grid, page_bottom, every_2
  category_top: ['category_after_banner'],
  category_after_quick_tabs: ['category_before_quick_tabs', 'category_after_banner'],
  category_sidebar_top: ['category_sidebar_middle', 'category_after_banner'],
  category_sidebar_bottom: ['category_sidebar_middle', 'category_below_sort'],
  category_above_sort: ['category_below_sort', 'category_after_banner'],

  // Home
  home_below_header: ['home_after_hero'],
  home_main: ['home_after_trends', 'home_after_hero'],
  home_after_promo: ['home_before_categories', 'home_after_trends'],
  home_between_categories_gift: ['home_after_categories', 'home_before_gift', 'home_after_gift'],
  home_before_gift: ['home_after_categories', 'home_after_gift'],
  home_before_reviews: ['home_after_reviews', 'home_after_gift'],

  // Product — many slots share product_top / product_above_cart / product_before_details
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

  // Checkout fallbacks (when all-steps slot empty)
  checkout_all_steps_top: ['checkout_step_bag_top'],
  checkout_all_steps_bottom: ['checkout_step_bag_bottom'],
  checkout_step_error_bottom: ['checkout_step_error_top', 'checkout_step_bag_bottom'],
  checkout_empty_cart: ['checkout_step_bag_top'],
  cart_above_checkout: ['site_common_ad'],
};

export function resolveAdCode(adCodes, primaryKey, extraFallbacks = []) {
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
    ...GLOBAL_FALLBACKS,
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

/** Returns HTML string for a placement (empty string if nothing saved). */
export function getAdCode(adCodes, primaryKey, extraFallbacks = []) {
  return resolveAdCode(adCodes, primaryKey, extraFallbacks).code;
}

/** `(key, ...extra) => code` helper for page components. */
export function makeAdResolver(adCodes) {
  return (primaryKey, ...extraFallbacks) => getAdCode(adCodes, primaryKey, extraFallbacks);
}
