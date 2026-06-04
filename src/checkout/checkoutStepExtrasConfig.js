/** Per-checkout-page extras — tips, perks, and product suggestion blocks */

export const CHECKOUT_STEP_EXTRAS = {
  bag: {
    showSuggestions: true,
    suggestionsTitle: 'Complete your look',
    suggestionsSubtitle: 'Trending picks to pair with your bag',
    perks: [
      { icon: 'truck', label: 'Free delivery', sub: 'Pan-India shipping' },
      { icon: 'refresh', label: 'Easy returns', sub: 'Hassle-free 7 days' },
      { icon: 'shield', label: 'Secure pay', sub: 'COD available' },
    ],
    tip: {
      tone: 'gold',
      title: 'Your style, delivered',
      text: 'Items in your bag are reserved while you checkout. Finish in a few quick steps.',
    },
  },
  savings: {
    tip: {
      tone: 'spark',
      title: 'Unlock extra savings',
      text: 'Apply a promo code now — discounts are locked in before payment.',
    },
    perks: [
      { icon: 'tag', label: 'Best offers', sub: 'Auto-applied deals' },
      { icon: 'sparkles', label: 'Member perks', sub: 'Sign in for more' },
    ],
  },
  totals: {
    tip: {
      tone: 'calm',
      title: 'No hidden charges',
      text: 'What you see is what you pay — free shipping included on this order.',
    },
    perks: [
      { icon: 'wallet', label: 'Pay on delivery', sub: 'COD accepted' },
      { icon: 'receipt', label: 'GST invoice', sub: 'On request' },
    ],
  },
  account: {
    tip: {
      tone: 'calm',
      title: 'Faster next time',
      text: 'Create an account to save addresses, track orders, and checkout in one tap.',
    },
  },
  contact: {
    tip: {
      tone: 'calm',
      title: 'Stay in the loop',
      text: 'We’ll send order updates and delivery alerts to your phone & email.',
    },
  },
  address: {
    showSuggestions: true,
    suggestionsTitle: 'You might also love',
    suggestionsSubtitle: 'Add before you place the order',
    tip: {
      tone: 'gold',
      title: 'Express dispatch',
      text: 'Orders confirmed before 2 PM ship the same day from our warehouse.',
    },
    perks: [
      { icon: 'map', label: 'Live tracking', sub: 'SMS updates' },
      { icon: 'home', label: 'Safe delivery', sub: 'Contactless option' },
    ],
  },
  review: {
    tip: {
      tone: 'spark',
      title: 'Double-check your picks',
      text: 'Review sizes and quantities — you can go back to edit anytime.',
    },
    perks: [
      { icon: 'truck', label: 'Free shipping', sub: 'Included' },
      { icon: 'shield', label: 'Quality check', sub: 'Before dispatch' },
    ],
  },
  summary: {
    showSuggestions: true,
    suggestionsTitle: 'Last-minute favourites',
    suggestionsSubtitle: 'Popular right now',
    tip: {
      tone: 'gold',
      title: 'Ready to ship',
      text: 'Your order summary looks great — one more step to place it.',
    },
  },
  payment: {
    tip: {
      tone: 'calm',
      title: 'Safe & secure',
      text: 'Pay on delivery — no online payment needed. Your data stays protected.',
    },
    perks: [
      { icon: 'shield', label: '256-bit secure', sub: 'Encrypted checkout' },
      { icon: 'wallet', label: 'COD only', sub: 'Pay when it arrives' },
      { icon: 'truck', label: 'Fast delivery', sub: '3–5 business days' },
    ],
  },
};

export function getCheckoutStepExtras(stepIndex, steps) {
  const id = steps[stepIndex]?.id;
  return (id && CHECKOUT_STEP_EXTRAS[id]) || null;
}
