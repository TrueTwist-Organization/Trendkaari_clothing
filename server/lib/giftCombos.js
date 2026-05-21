/** Gift collection couple combos — stored in store.json, editable from admin */

export const GIFT_COMBO_THEMES = ['emerald', 'burgundy', 'navy'];

export const DEFAULT_GIFT_COMBOS = [
  {
    id: 'couple-mr-mrs-tee',
    active: true,
    sortOrder: 0,
    theme: 'navy',
    badge: 'Mr & Mrs tee',
    name: 'Mr & Mrs Navy Pocket Tee Set',
    description:
      'Matching navy couple tees — his Mr bear pocket & her Mrs panda pocket. Perfect anniversary or wedding gift.',
    heroImage: '/combos/combo-mr-mrs-couple.png',
    comboImages: [
      '/combos/combo-mr-mrs-couple.png',
      '/combos/combo-mr-mrs-him.png',
      '/combos/combo-mr-mrs-her.png',
      '/combos/combo-mr-mrs-pack.png',
    ],
    productId: 2205,
    partnerProductId: 3601,
    galleryProductIds: [2205, 3601],
    price: 549,
  },
  {
    id: 'couple-teal-patola',
    active: true,
    sortOrder: 1,
    theme: 'emerald',
    badge: 'Festive patola',
    name: 'Teal Patola Silk Saree & Kurta Set',
    description:
      'Her teal diamond-print silk saree with his white kurta & matching printed Nehru jacket — coordinated for weddings & sangeet.',
    heroImage: '/combos/combo-teal-patola-couple.png',
    comboImages: [
      '/combos/combo-teal-patola-couple.png',
      '/combos/combo-teal-patola-him.png',
      '/combos/combo-teal-patola-festive.png',
    ],
    productId: 1021,
    partnerProductId: 3906,
    galleryProductIds: [1021, 3906],
    price: 799,
  },
  {
    id: 'couple-champagne-gold',
    active: true,
    sortOrder: 2,
    theme: 'burgundy',
    badge: 'Golden duo',
    name: 'Champagne Gold Striped Couple Set',
    description:
      'Her gold-striped silk saree with his matching textured kurta & white pajama — elegant coordinated look for weddings & receptions.',
    heroImage: '/combos/combo-champagne-couple.png',
    comboImages: [
      '/combos/combo-champagne-couple.png',
      '/combos/combo-champagne-duo.png',
      '/combos/combo-champagne-her.png',
      '/combos/combo-champagne-him.png',
    ],
    productId: 1020,
    partnerProductId: 3906,
    galleryProductIds: [1020, 3906],
    price: 849,
  },
  {
    id: 'couple-sunflower-resort',
    active: true,
    sortOrder: 3,
    theme: 'emerald',
    badge: 'Resort match',
    name: 'Sunflower Print Resort Couple Set',
    description:
      'Her off-shoulder crop co-ord & his matching sunflower shirt with brown chinos — sunny vacation-ready his & hers.',
    heroImage: '/combos/combo-sunflower-resort.png',
    comboImages: [
      '/combos/combo-sunflower-resort.png',
      '/combos/combo-sunflower-garden.png',
      '/combos/combo-sunflower-back.png',
      '/combos/combo-sunflower-surprise.png',
      '/combos/combo-sunflower-studio.png',
    ],
    productId: 2101,
    partnerProductId: 3405,
    galleryProductIds: [2101, 3405],
    price: 649,
  },
  {
    id: 'couple-evil-eye',
    active: true,
    sortOrder: 4,
    theme: 'navy',
    badge: 'Evil eye duo',
    name: 'Blue Evil Eye Print Couple Set',
    description:
      'Her tiered midi dress & his matching nazar-print shirt with cream trousers — coordinated bohemian his & hers for brunch & getaways.',
    heroImage: '/combos/combo-evil-eye-couple.png',
    comboImages: [
      '/combos/combo-evil-eye-couple.png',
      '/combos/combo-evil-eye-her.png',
      '/combos/combo-evil-eye-him.png',
      '/combos/combo-evil-eye-dress.png',
    ],
    productId: 2004,
    partnerProductId: 3503,
    galleryProductIds: [2004, 3503],
    price: 599,
  },
  {
    id: 'couple-velvet-rose',
    active: true,
    sortOrder: 5,
    theme: 'burgundy',
    badge: 'Evening royal',
    name: 'Navy Velvet & Dusty Rose Lehenga Set',
    description:
      'Her embroidered dusty-rose lehenga with his navy velvet floral bandhgala & trousers — luxe couple look for receptions & sangeet.',
    heroImage: '/combos/combo-velvet-rose-couple.png',
    comboImages: [
      '/combos/combo-velvet-rose-couple.png',
      '/combos/combo-velvet-rose-her.png',
      '/combos/combo-velvet-rose-her-back.png',
      '/combos/combo-velvet-rose-him.png',
      '/combos/combo-velvet-rose-him-full.png',
      '/combos/combo-velvet-rose-him-back.png',
    ],
    productId: 1015,
    partnerProductId: 3301,
    galleryProductIds: [1015, 3301],
    price: 999,
  },
];

function slugId(name) {
  return String(name || 'combo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `combo-${Date.now()}`;
}

function parseImageList(value) {
  if (Array.isArray(value)) {
    return value.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeGiftCombo(raw, index = 0) {
  const comboImages = parseImageList(raw.comboImages);
  const heroImage = String(raw.heroImage || comboImages[0] || '').trim();
  const images = comboImages.length ? comboImages : heroImage ? [heroImage] : [];
  const productId = Number(raw.productId);
  const partnerProductId =
    raw.partnerProductId != null && raw.partnerProductId !== ''
      ? Number(raw.partnerProductId)
      : null;
  const galleryProductIds = parseImageList(raw.galleryProductIds).length
    ? parseImageList(raw.galleryProductIds).map(Number).filter((n) => !Number.isNaN(n))
    : [productId, partnerProductId].filter((n) => n && !Number.isNaN(n));

  const theme = GIFT_COMBO_THEMES.includes(raw.theme) ? raw.theme : 'emerald';

  return {
    id: String(raw.id || slugId(raw.name)).trim() || slugId(raw.name),
    active: raw.active !== false,
    sortOrder: Number.isFinite(Number(raw.sortOrder)) ? Number(raw.sortOrder) : index,
    theme,
    badge: String(raw.badge || 'Couple combo').trim(),
    name: String(raw.name || 'Gift combo').trim(),
    description: String(raw.description || '').trim(),
    heroImage: heroImage || images[0] || '',
    comboImages: images.length ? images : heroImage ? [heroImage] : [],
    productId: Number.isNaN(productId) ? null : productId,
    partnerProductId: partnerProductId != null && !Number.isNaN(partnerProductId) ? partnerProductId : null,
    galleryProductIds,
    price: Math.max(1, Math.round(Number(raw.price) || 0)),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function validateGiftCombo(combo) {
  const errors = [];
  if (!combo.name) errors.push('Combo name is required');
  if (!combo.heroImage && !combo.comboImages?.length) errors.push('At least one image is required');
  if (!combo.productId) errors.push('Primary product ID is required');
  if (!combo.price || combo.price < 1) errors.push('Valid combo price is required');
  return errors;
}

/** Admin / persisted list only */
export function getAdminGiftCombos(store) {
  if (!Array.isArray(store?.giftCombos)) return [];
  return store.giftCombos.map((c, i) => normalizeGiftCombo(c, i));
}

function withDefaultCombos(list) {
  return list.length
    ? list
    : DEFAULT_GIFT_COMBOS.map((c, i) => normalizeGiftCombo(c, i));
}

/** Storefront — active combos only, sorted; falls back to built-in defaults if store empty */
export function getPublicGiftCombos(store) {
  return withDefaultCombos(getAdminGiftCombos(store))
    .filter((c) => c.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Ensure store has giftCombos array (used when admin opens combos page) */
export function seedGiftCombosIfEmpty(store) {
  if (Array.isArray(store.giftCombos) && store.giftCombos.length > 0) {
    return getAdminGiftCombos(store);
  }
  return DEFAULT_GIFT_COMBOS.map((c, i) => normalizeGiftCombo(c, i));
}

export function buildGiftComboFromBody(body, existing = null) {
  const merged = {
    ...existing,
    ...body,
    id: body.id ?? existing?.id,
  };
  return normalizeGiftCombo(merged, existing?.sortOrder ?? 0);
}
