export const LADIES_CATEGORIES = [
  { value: 'kurtas', label: 'Kurtas' },
  { value: 'suit sets', label: 'Suit Sets' },
  { value: 'lehengas', label: 'Lehengas' },
  { value: 'sarees', label: 'Sarees' },
  { value: 'dupatta sets', label: 'Dupatta Sets' },
  { value: 'tops', label: 'Tops' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'co-ords', label: 'Co-ord Sets' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'other', label: 'Other' },
];

export const GENTS_CATEGORIES = [
  { value: 'shirts', label: 'Shirts' },
  { value: 'pants', label: 'Pants' },
  { value: 'gents t-shirts', label: 'T-Shirts' },
  { value: 'gents kurtas', label: "Men's Kurtas" },
  { value: 'jackets', label: 'Jackets' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'trackpants', label: 'Track Pants' },
  { value: 'gents co-ords', label: "Men's Co-ords" },
  { value: 'hoodies', label: 'Hoodies' },
  { value: 'blazers', label: 'Blazers' },
  { value: 'other', label: 'Other' },
];

export const FABRIC_TAGS = ['Silk', 'Cotton', 'Linen', 'Denim', 'Georgette', 'Viscose', 'Muslin'];

export const LADIES_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
export const GENTS_SIZES = ['38', '40', '42', '44', '46'];

export function sizesForGender(gender) {
  return gender === 'gents' ? GENTS_SIZES : LADIES_SIZES;
}

/** Preset color variants for admin product wizard */
export const PRODUCT_COLORS = [
  { value: 'Default', label: 'Default', hex: '#f0f0f0' },
  { value: 'Ivory / White', label: 'Ivory / White', hex: '#f5f0e6' },
  { value: 'Black', label: 'Black', hex: '#1a1a1a' },
  { value: 'Navy Blue', label: 'Navy Blue', hex: '#1e3a5f' },
  { value: 'Indigo / Midnight Blue', label: 'Indigo / Midnight Blue', hex: '#2c3e6b' },
  { value: 'Royal Blue', label: 'Royal Blue', hex: '#2563eb' },
  { value: 'Teal / Green', label: 'Teal / Green', hex: '#0d9488' },
  { value: 'Sage Green / Olive', label: 'Sage Green / Olive', hex: '#8a9a5b' },
  { value: 'Emerald Green', label: 'Emerald Green', hex: '#047857' },
  { value: 'Wine / Magenta', label: 'Wine / Magenta', hex: '#7b1f4a' },
  { value: 'Maroon / Burgundy', label: 'Maroon / Burgundy', hex: '#600b45' },
  { value: 'Pink / Peach / Coral', label: 'Pink / Peach / Coral', hex: '#f4a6a6' },
  { value: 'Red', label: 'Red', hex: '#c62828' },
  { value: 'Yellow / Mustard', label: 'Yellow / Mustard', hex: '#d4a017' },
  { value: 'Beige / Cream', label: 'Beige / Cream', hex: '#e8dcc8' },
  { value: 'Brown / Tan', label: 'Brown / Tan', hex: '#8b6914' },
  { value: 'Grey', label: 'Grey', hex: '#9e9e9e' },
  { value: 'Gold / Metallic', label: 'Gold / Metallic', hex: '#d4b483' },
  { value: 'Multi / Printed', label: 'Multi / Printed', hex: '#c4b5fd' },
];

export function hexForProductColor(colorName) {
  const match = PRODUCT_COLORS.find((c) => c.value === colorName);
  return match?.hex ?? '#b0b0b0';
}
