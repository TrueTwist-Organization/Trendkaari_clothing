/** Build full PDP payload when opening a Gift Collection combo card */

function findProductById(productsList, id) {
  if (id == null || id === '' || !Array.isArray(productsList)) return null;
  const num = Number(id);
  return productsList.find(
    (p) => p.id === id || p.id === num || String(p.id) === String(id),
  );
}

function resolveGalleryProductIds(look) {
  if (look.galleryProductIds?.length) {
    return look.galleryProductIds.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n > 0);
  }
  if (look.partnerProductId) {
    return [look.productId, look.partnerProductId]
      .map((id) => Number(id))
      .filter((n) => !Number.isNaN(n) && n > 0);
  }
  const single = Number(look.productId);
  return !Number.isNaN(single) && single > 0 ? [single] : [];
}

/** Gift combo PDP — use look.comboImages when set, else single hero */
function buildComboGalleryImages(look) {
  if (look.comboImages?.length) {
    return look.comboImages.filter(Boolean);
  }
  const hero = look.heroImage || look.image;
  if (!hero) return [];
  return [hero];
}

function resolveLinkedProducts(look, productsList) {
  const galleryIds = resolveGalleryProductIds(look);
  const galleryProducts = galleryIds
    .map((id) => findProductById(productsList, id))
    .filter(Boolean);

  const primary =
    findProductById(productsList, look.productId) ||
    galleryProducts[0] ||
    null;

  const partner =
    look.partnerProductId && Number(look.partnerProductId) !== Number(look.productId)
      ? findProductById(productsList, look.partnerProductId)
      : galleryProducts.length > 1
        ? galleryProducts[galleryProducts.length - 1]
        : null;

  return { primary, partner, galleryProducts, galleryIds };
}

function buildComboOnlyPayload(look, images, tabLabel) {
  const hero = look.heroImage || look.image || images[0] || '';
  const originalPrice =
    look.originalPrice ?? Math.max(look.price * 2, Math.round(look.price * 1.35));

  const discountPct = Math.max(
    5,
    Math.min(70, Math.round((1 - look.price / originalPrice) * 100)),
  );

  return {
    id: look.id || `gift-combo-${Date.now()}`,
    productId: look.productId || look.id,
    name: look.name,
    title: look.name,
    description: look.description || '',
    descriptionLong:
      look.description ||
      `${look.name} — curated couple gift combo from Trendkaari.`,
    heroImage: hero,
    image: images[0] || hero,
    images: images.length ? images : hero ? [hero] : [],
    price: look.price,
    originalPrice,
    discount: `${discountPct}% OFF`,
    aboutItems: [
      `${look.badge || 'Gift edit'} — hand-picked combo`,
      'Curated look as shown in the combo edit',
      'Ideal for festivals, weddings & family functions',
      'Ships as a ready-to-style coordinated look',
    ],
    highlights: {
      'COMBO TYPE': tabLabel,
      INCLUDES: look.name,
      'GIFT PRICE': `₹${look.price.toLocaleString('en-IN')}`,
    },
    isGiftCombo: true,
    comboBadge: look.badge,
    comboIncludes: look.name,
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'gift',
    subCategory: 'gift combos',
    wearType: 'traditional',
    rating: '4.8',
    reviewsCount: 24,
    partnerProduct: null,
    comboGiftId: look.id,
  };
}

export function buildGiftComboPayload(look, productsList) {
  if (!look?.name && !look?.heroImage && !look?.comboImages?.length) return null;

  const images = buildComboGalleryImages(look);
  const hero = look.heroImage || look.image;
  if (!hero && !images.length) return null;

  const tabLabel =
    look.tab === 'couple' ? 'Couple match' : look.tab === 'her' ? 'For her' : 'For him';

  const { primary, partner, galleryProducts } = resolveLinkedProducts(look, productsList);

  if (!primary) {
    return buildComboOnlyPayload(look, images, tabLabel);
  }

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
    comboGiftId: look.id,
  };
}
