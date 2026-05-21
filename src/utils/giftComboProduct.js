/** Build full PDP payload when opening a Gift Collection combo card */

function resolveGalleryProductIds(look) {
  if (look.galleryProductIds?.length) {
    return look.galleryProductIds;
  }
  if (look.partnerProductId) {
    return [look.productId, look.partnerProductId].filter(Boolean);
  }
  return look.productId ? [look.productId] : [];
}

/** Gift combo PDP — show only the combo card image (no extra catalog angles) */
function buildComboGalleryImages(look) {
  const hero = look.heroImage || look.image;
  if (!hero) return [];
  return [hero];
}

export function buildGiftComboPayload(look, productsList) {
  if (!look?.productId || !Array.isArray(productsList)) return null;

  const primary = productsList.find((p) => p.id === look.productId);
  if (!primary) return null;

  const galleryIds = resolveGalleryProductIds(look);
  const galleryProducts = galleryIds
    .map((id) => productsList.find((p) => p.id === id))
    .filter(Boolean);

  const partner =
    look.partnerProductId && look.partnerProductId !== look.productId
      ? productsList.find((p) => p.id === look.partnerProductId)
      : galleryProducts.length > 1
        ? galleryProducts[galleryProducts.length - 1]
        : null;

  const hero = look.heroImage || look.image;
  const images = buildComboGalleryImages(look);

  const comboIncludes =
    galleryProducts.length > 1
      ? galleryProducts.map((p) => p.title).join(' + ')
      : primary.title;

  const originalPrice =
    look.originalPrice ??
    (galleryProducts.length > 1
      ? galleryProducts.reduce(
          (sum, p) => sum + (p.originalPrice || p.price * 2),
          0,
        )
      : Math.round((primary.originalPrice || primary.price * 2) * 1.15));

  const discountPct = Math.max(
    5,
    Math.min(70, Math.round((1 - look.price / originalPrice) * 100)),
  );

  const tabLabel =
    look.tab === 'couple' ? 'Couple match' : look.tab === 'her' ? 'For her' : 'For him';

  return {
    id: primary.id,
    productId: primary.id,
    name: look.name,
    title: look.name,
    description: look.description,
    descriptionLong: `${look.description}\n\nThis curated gift combo brings together ${comboIncludes} — styled as a coordinated out-of-box look from Trendkaari. Perfect for gifting or wearing together at celebrations.`,
    heroImage: hero,
    image: images[0] || hero,
    images,
    price: look.price,
    originalPrice,
    discount: `${discountPct}% OFF`,
    aboutItems: [
      `${look.badge || 'Gift edit'} — hand-picked combo`,
      partner
        ? 'Styled couple look — her & his pieces coordinated together'
        : 'Curated look as shown in the combo edit',
      'Ideal for festivals, weddings & family functions',
      'Ships as a ready-to-style coordinated look',
    ],
    highlights: {
      'COMBO TYPE': tabLabel,
      INCLUDES: comboIncludes,
      'GIFT PRICE': `₹${look.price.toLocaleString('en-IN')}`,
    },
    isGiftCombo: true,
    comboBadge: look.badge,
    comboIncludes,
    sizes: primary.sizes?.length ? primary.sizes : ['S', 'M', 'L', 'XL'],
    category: primary.category,
    subCategory: primary.subCategory,
    wearType: primary.wearType,
    rating: primary.rating,
    reviewsCount: primary.reviewsCount,
    partnerProduct: partner
      ? { id: partner.id, title: partner.title, image: partner.image }
      : null,
  };
}
