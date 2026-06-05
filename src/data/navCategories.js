/** Sidebar menu — grouped by gender, then Traditional / Western wear. */

export const MENU_WOMEN_GROUPS = [
  {
    id: 'women-traditional',
    label: 'Traditional Wear',
    categories: [
      { tag: 'dupatta sets', label: 'Dupatta Sets' },
      { tag: 'kurtas', label: 'Kurtis & Kurtas' },
      { tag: 'suit sets', label: 'Suits & Suit Sets' },
      { tag: 'sarees', label: 'Sarees' },
      { tag: 'lehengas', label: 'Lehengas' },
    ],
  },
  {
    id: 'women-western',
    label: 'Western Wear',
    categories: [
      { tag: 'tops', label: 'Tops & Tunics' },
      { tag: 'dresses', label: 'Dresses' },
      { tag: 'co-ords', label: 'Co-ord Sets' },
      { tag: 't-shirts', label: 'T-Shirts' },
      { tag: 'bottoms', label: 'Bottom Wear' },
    ],
  },
];

export const MENU_MEN_GROUPS = [
  {
    id: 'men-traditional',
    label: 'Traditional Wear',
    categories: [
      { tag: 'gents kurtas', label: 'Kurtas' },
      { tag: 'gents co-ords', label: 'Co-ord Sets (Ethnic)' },
      { tag: 'jackets', label: 'Jackets' },
      { tag: 'blazers', label: 'Blazers (Ethnic / Wedding style)' },
    ],
  },
  {
    id: 'men-western',
    label: 'Western Wear',
    categories: [
      { tag: 'shirts', label: 'Shirts' },
      { tag: 'gents t-shirts', label: 'T-Shirts' },
      { tag: 'pants', label: 'Pants' },
      { tag: 'jeans', label: 'Jeans' },
      { tag: 'hoodies', label: 'Hoodies' },
      { tag: 'trackpants', label: 'Track Pants' },
    ],
  },
];

/** Flat lists for quick tabs / lookups */
export const MENU_WOMEN_CATEGORIES = MENU_WOMEN_GROUPS.flatMap((g) => g.categories);
export const MENU_MEN_CATEGORIES = MENU_MEN_GROUPS.flatMap((g) => g.categories);

export function findMenuGroupForTag(tag) {
  const normalized = tag.toLowerCase();
  for (const group of [...MENU_WOMEN_GROUPS, ...MENU_MEN_GROUPS]) {
    if (group.id === normalized) return group;
    if (group.categories.some((c) => c.tag === normalized)) return group;
  }
  return null;
}
