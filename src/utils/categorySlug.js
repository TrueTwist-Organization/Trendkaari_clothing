import { MENU_MEN_GROUPS, MENU_WOMEN_GROUPS } from '../data/navCategories';

/** "dupatta sets" → "dupatta-sets" for clean URLs (no %20). */
export function categoryToSlug(category) {
  if (!category || category === 'all') return '';
  return String(category)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildSlugLookup() {
  const lookup = new Map();
  const add = (tag) => {
    if (!tag) return;
    lookup.set(categoryToSlug(tag), tag.toLowerCase());
  };

  for (const group of [...MENU_WOMEN_GROUPS, ...MENU_MEN_GROUPS]) {
    add(group.id);
    for (const cat of group.categories) add(cat.tag);
  }

  return lookup;
}

const SLUG_LOOKUP = buildSlugLookup();

/** URL segment → internal category tag ("dupatta-sets" → "dupatta sets"). */
export function slugToCategory(slug) {
  if (!slug) return 'all';

  const decoded = decodeURIComponent(String(slug)).trim().toLowerCase();
  if (decoded === 'all') return 'all';

  if (SLUG_LOOKUP.has(decoded)) return SLUG_LOOKUP.get(decoded);

  const fromHyphens = decoded.replace(/-/g, ' ');
  const hyphenSlug = categoryToSlug(fromHyphens);
  if (SLUG_LOOKUP.has(hyphenSlug)) return SLUG_LOOKUP.get(hyphenSlug);

  return fromHyphens || decoded;
}

/** Canonical path for a category: /category/dupatta-sets */
export function categoryPath(category) {
  if (!category || category === 'all') return '/';
  return `/category/${categoryToSlug(category)}`;
}

/** Replace legacy /category/dupatta%20sets with /category/dupatta-sets */
export function normalizeCategoryPathname(pathname = '') {
  const segments = String(pathname || '').split('/').filter(Boolean);
  if (segments[0] !== 'category' || !segments[1]) return pathname;
  return categoryPath(slugToCategory(segments[1]));
}
