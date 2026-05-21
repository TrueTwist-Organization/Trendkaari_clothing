/** Product filtering by route category slug (subCategory or wear group). */

import { MENU_MEN_GROUPS, MENU_WOMEN_GROUPS } from '../data/navCategories';

function subTagsForGroup(groupId) {
  const group = MENU_MEN_GROUPS.find((g) => g.id === groupId);
  return group?.categories.map((c) => c.tag) ?? [];
}

const WEAR_GROUP_FILTERS = {
  'women-traditional': {
    genders: ['women'],
    wearTypes: ['traditional'],
  },
  'women-western': {
    genders: ['women'],
    wearTypes: ['western'],
  },
  'men-traditional': {
    genders: ['men', 'gents'],
    subCategories: subTagsForGroup('men-traditional'),
  },
  'men-western': {
    genders: ['men', 'gents'],
    subCategories: subTagsForGroup('men-western'),
  },
};

export function isWearGroupCategory(category) {
  return Boolean(WEAR_GROUP_FILTERS[category?.toLowerCase()]);
}

const CATEGORY_ALIASES = {
  'nehru jackets': 'jackets',
};

export function filterProductsByCategory(products, activeCategory) {
  const raw = (activeCategory || 'all').toLowerCase();
  const cat = CATEGORY_ALIASES[raw] || raw;
  if (cat === 'all') return products;

  const group = WEAR_GROUP_FILTERS[cat];
  if (group) {
    return products.filter((p) => {
      const gender = (p.category || '').toLowerCase();
      if (!group.genders.includes(gender)) return false;

      if (group.subCategories) {
        return group.subCategories.includes((p.subCategory || '').toLowerCase());
      }

      const wear = (p.wearType || '').toLowerCase();
      return group.wearTypes.includes(wear);
    });
  }

  return products.filter((p) => (p.subCategory || '').toLowerCase() === cat);
}

export function getCategoryDisplayName(activeCategory) {
  const cat = (activeCategory || '').toLowerCase();

  for (const group of [...MENU_WOMEN_GROUPS, ...MENU_MEN_GROUPS]) {
    if (group.id === cat) {
      if (group.id.startsWith('women')) return `Women's ${group.label}`;
      if (group.id.startsWith('men')) return `Men's ${group.label}`;
      return group.label;
    }
    const match = group.categories.find((c) => c.tag === cat);
    if (match) return match.label;
  }

  const labels = {
    'women-traditional': "Women's Traditional Wear",
    'women-western': "Women's Western Wear",
    'men-traditional': "Men's Traditional Wear",
    'men-western': "Men's Western Wear",
    other: 'Other',
  };
  return labels[cat] || activeCategory;
}
