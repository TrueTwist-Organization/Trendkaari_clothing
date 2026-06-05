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
      text: 'Items in your bag are held while you checkout. Complete the steps below to place your order.',
    },
  },
  savings: {
    tip: {
      tone: 'spark',
      title: 'Unlock extra savings',
      text: 'Apply a promo code now — your discount is locked in before you pay.',
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
      text: 'What you see is what you pay. Shipping is included on this order.',
    },
    perks: [
      { icon: 'wallet', label: 'Pay on delivery', sub: 'COD accepted' },
      { icon: 'receipt', label: 'GST invoice', sub: 'On request' },
    ],
  },
  contact: {
    tip: {
      tone: 'calm',
      title: 'Stay updated',
      text: 'Use email or phone — whichever you prefer. Order and delivery updates go to the one you enter.',
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
      title: 'Review your order',
      text: 'Check sizes and quantities carefully. You can go back to edit anytime.',
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
      title: 'Almost there',
      text: 'Your order summary is ready. One final step to place your order.',
    },
  },
  payment: {
    tip: {
      tone: 'calm',
      title: 'Pay with confidence',
      text: 'Cash on delivery is available. Your information stays secure throughout checkout.',
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
