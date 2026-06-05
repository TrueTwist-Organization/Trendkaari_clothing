/** Fixed ad placements — admin pastes HTML/JS; storefront injects per slot */

import { CHECKOUT_BASE, CHECKOUT_STEPS } from '../checkout/checkoutSteps.js';

const COMMON_SLOTS = [
  {
    key: 'site_common_ad',
    title: 'All Pages — Common Ad',
    description:
      'Paste ad code once — shows below the site header on every page (home, category, product, info). Google Analytics, Snapchat Pixel, and similar tracking scripts are injected into the page <head> automatically.',
    placeholder: 'Paste ad HTML/script (e.g. Google AdSense)…',
  },
];

const HOME_SLOTS = [
  {
    key: 'home_below_header',
    title: 'Home — Top (Below Header)',
    description: 'First slot on homepage, immediately under the site header (before hero arches).',
    placeholder: 'Paste ad HTML/script — top of homepage…',
  },
  {
    key: 'home_after_hero',
    title: 'Home — After Hero',
    description: 'Full-width strip after the “Look Good / Feel Good” hero arches section.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_after_trends',
    title: 'Home — After Shop by Trends',
    description: 'Below the “Shop by Trends” carousel.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_main',
    title: 'Home — Before Promo Banner',
    description: 'Above the large promo banner slider (women/men/combo banners).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_after_promo',
    title: 'Home — After Promo Banner',
    description: 'Below the promo banner slider, before “Shop by Categories”.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_before_categories',
    title: 'Home — Before Categories',
    description: 'Directly above “Shop by Categories” (women & gents circles).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_between_categories_gift',
    title: 'Home — Between Categories & Gift',
    description:
      'Homepage — exactly between “Shop by Categories” (circle icons) and “Gift Collection” (unbox boxes). Full-width strip in that gap.',
    placeholder: 'Paste ad HTML/script (banner, AdSense, image ad)…',
  },
  {
    key: 'home_after_gift',
    title: 'Home — After Gift Section',
    description: 'Below the gift collection section.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_before_reviews',
    title: 'Home — Before Reviews',
    description: 'Above customer reviews / testimonials.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'home_after_reviews',
    title: 'Home — Bottom (After Reviews)',
    description: 'Last homepage slot — after reviews, before footer.',
    placeholder: 'Paste ad HTML/script…',
  },
];

const CATEGORY_SLOTS = [
  {
    key: 'category_top',
    title: 'Category — Top of Page',
    description: '/category listing — above title banner (first slot on page).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_after_banner',
    title: 'Category — After Title Banner',
    description: 'Below category title, tagline & description block.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_before_quick_tabs',
    title: 'Category — Before Quick Tabs',
    description: 'Above “Jump to Collection” tabs bar.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_after_quick_tabs',
    title: 'Category — After Quick Tabs',
    description: 'Below quick tabs, above filters + product grid.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_sidebar_top',
    title: 'Category — Sidebar Top',
    description: 'Filter sidebar — below “Refine Products” header.',
    placeholder: 'Paste ad HTML/script (narrow/sidebar ad)…',
  },
  {
    key: 'category_sidebar_middle',
    title: 'Category — Sidebar Middle',
    description: 'Filter sidebar — after size/color filters.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_sidebar_bottom',
    title: 'Category — Sidebar Bottom',
    description: 'Filter sidebar — bottom (above trust strip).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_above_sort',
    title: 'Category — Above Sort Bar',
    description: 'Product area — above “Showing X styles” & sort dropdown.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_below_sort',
    title: 'Category — Below Sort Bar',
    description: 'Product area — below sort bar, above product grid.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'ads_every_2_products',
    title: 'Category — Every 2 Products (In Grid)',
    description:
      'Inside product grid — full-width row after every 2 products (2, 4, 6…).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_after_grid',
    title: 'Category — After Product Grid',
    description: 'Below all product cards (when grid has items).',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'category_page_bottom',
    title: 'Category — Page Bottom',
    description: 'Last slot on /category — after grid & filters section.',
    placeholder: 'Paste ad HTML/script…',
  },
];

const PRODUCT_SLOTS = [
  {
    key: 'product_top',
    title: 'Product — Top (Below Breadcrumb)',
    description: '/product page — below breadcrumb, above image + details.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_gallery_bottom',
    title: 'Product — Below Gallery',
    description: 'Left column — under main product image.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_title',
    title: 'Product — After Title',
    description: 'Right column — below product title & SKU.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_rating',
    title: 'Product — After Ratings',
    description: 'Below star rating & review count.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_price',
    title: 'Product — After Price',
    description: 'Below price box & “inclusive of taxes”.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_offers',
    title: 'Product — After Coupons Box',
    description: 'Below “Exclusive Online Offers & Coupons”.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_before_size',
    title: 'Product — Before Size Selector',
    description: 'Above “Select Size” row.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_size',
    title: 'Product — After Size Selector',
    description: 'Below size pills, above quantity.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_above_cart',
    title: 'Product — Above Quantity',
    description: 'Above quantity counter.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_below_cart',
    title: 'Product — Below Add to Bag',
    description: 'Below ADD TO BAG / Wishlist buttons.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_before_details',
    title: 'Product — Before Long Details',
    description: 'Above “Product description / About” accordion section.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_details',
    title: 'Product — After Long Details',
    description: 'Below description / highlights / size chart block.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_before_trust',
    title: 'Product — Before Trust Strip',
    description: 'Above shipping / returns / original icons.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_trust',
    title: 'Product — After Trust Strip',
    description: 'Below trust icons row.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_before_suggestions',
    title: 'Product — Before You May Also Like',
    description: 'Above related products grid.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_suggestions_every_2',
    title: 'Product — Every 2 Suggestions',
    description: 'Inside “You may also like” — after every 2 related products.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_after_suggestions',
    title: 'Product — After Suggestions',
    description: 'Below related products section.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'product_page_bottom',
    title: 'Product — Page Bottom',
    description: 'Last slot on product page (before footer).',
    placeholder: 'Paste ad HTML/script…',
  },
];

const CHECKOUT_STEP_PAGE_SLOTS = CHECKOUT_STEPS.flatMap((step) => [
  {
    key: `checkout_step_${step.id}_top`,
    title: `Checkout — ${step.label} (Top Ad)`,
    description: `${CHECKOUT_BASE}/${step.path} — ad above the checkout card.`,
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: `checkout_step_${step.id}_bottom`,
    title: `Checkout — ${step.label} (Bottom Ad)`,
    description: `${CHECKOUT_BASE}/${step.path} — ad below the card, above Back/Continue.`,
    placeholder: 'Paste ad HTML/script…',
  },
]);

const CHECKOUT_ERROR_PAGE_SLOTS = [
  {
    key: 'checkout_step_error_top',
    title: 'Checkout — Technical Error (Top Ad)',
    description: `${CHECKOUT_BASE}/error — order failed / technical error screen.`,
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'checkout_step_error_bottom',
    title: 'Checkout — Technical Error (Bottom Ad)',
    description: `${CHECKOUT_BASE}/error — bottom ad on technical error page.`,
    placeholder: 'Paste ad HTML/script…',
  },
];

const CHECKOUT_SLOTS = [
  {
    key: 'cart_above_checkout',
    title: 'Cart — Above Checkout Button',
    description: 'Cart drawer — above “Proceed to Checkout”.',
    placeholder: 'Paste ad HTML/script…',
  },
  {
    key: 'checkout_all_steps_top',
    title: 'Checkout — All Steps (Top)',
    description: 'Optional shared top slot — only used if you wire it on a checkout page; per-step top slots are preferred.',
    placeholder: 'Paste ad HTML/script for checkout top…',
  },
  {
    key: 'checkout_all_steps_bottom',
    title: 'Checkout — All Steps (Bottom)',
    description: 'Optional shared bottom slot — only used if you wire it on a checkout page; per-step bottom slots are preferred.',
    placeholder: 'Paste ad HTML/script for checkout bottom…',
  },
  ...CHECKOUT_STEP_PAGE_SLOTS,
  ...CHECKOUT_ERROR_PAGE_SLOTS,
  {
    key: 'checkout_empty_cart',
    title: 'Checkout — Empty Bag',
    description: `${CHECKOUT_BASE}/bag when the cart is empty.`,
    placeholder: 'Paste ad HTML/script…',
  },
];

const OTHER_SLOTS = [
  {
    key: 'global_banner',
    title: 'Global Banner',
    description: 'Every page — directly below site header.',
    placeholder: 'Paste ad HTML/script (e.g. Google Tag Manager)…',
  },
];

/** Common → Checkout → Homepage → Category → Product → other */
export const AD_PLACEMENT_DEFINITIONS = [
  ...COMMON_SLOTS,
  ...CHECKOUT_SLOTS,
  ...HOME_SLOTS,
  ...CATEGORY_SLOTS,
  ...PRODUCT_SLOTS,
  ...OTHER_SLOTS,
];

export const COMMON_AD_PLACEMENT_KEYS = COMMON_SLOTS.map((d) => d.key);

export const CHECKOUT_AD_PLACEMENT_KEYS = CHECKOUT_SLOTS.map((d) => d.key);

export const HOME_AD_PLACEMENT_KEYS = HOME_SLOTS.map((d) => d.key);

export const CATEGORY_AD_PLACEMENT_KEYS = CATEGORY_SLOTS.map((d) => d.key);

export const PRODUCT_AD_PLACEMENT_KEYS = PRODUCT_SLOTS.map((d) => d.key);

export const OTHER_AD_PLACEMENT_KEYS = OTHER_SLOTS.map((d) => d.key);

/** Admin panel section order */
export const AD_PLACEMENT_SECTIONS = [
  { id: 'common', title: 'Common — All Pages', keys: COMMON_AD_PLACEMENT_KEYS },
  { id: 'checkout', title: 'Checkout — Every Page', keys: CHECKOUT_AD_PLACEMENT_KEYS },
  { id: 'home', title: 'Homepage', keys: HOME_AD_PLACEMENT_KEYS },
  { id: 'category', title: 'Category Listing', keys: CATEGORY_AD_PLACEMENT_KEYS },
  { id: 'product', title: 'Product Detail', keys: PRODUCT_AD_PLACEMENT_KEYS },
  { id: 'other', title: 'Other', keys: OTHER_AD_PLACEMENT_KEYS },
];

export const AD_PLACEMENT_KEYS = AD_PLACEMENT_DEFINITIONS.map((d) => d.key);

/** Saved GPT code for homepage + key pages (one unique ad per section gap). */
export const PRIMARY_AD_PLACEMENT_KEYS = [
  'site_common_ad',
  ...HOME_AD_PLACEMENT_KEYS,
  'category_top',
  'category_page_bottom',
  'product_top',
  'product_page_bottom',
  'cart_above_checkout',
  'checkout_all_steps_top',
  'checkout_all_steps_bottom',
];
