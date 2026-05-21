import { MENU_MEN_GROUPS, MENU_WOMEN_GROUPS } from '../data/navCategories';

/** Searchable catalog sections (wear groups + sub-categories). */
function buildSectionIndex() {
  const sections = [];

  for (const group of MENU_WOMEN_GROUPS) {
    sections.push({
      slug: group.id,
      label: `Women's ${group.label}`,
      keywords: [
        group.id,
        group.label,
        'women',
        'woman',
        'ladies',
        'female',
        group.id.includes('traditional') ? 'traditional ethnic women' : 'western women',
      ],
    });
    for (const cat of group.categories) {
      sections.push({
        slug: cat.tag,
        label: cat.label,
        keywords: [cat.tag, cat.label, 'women', 'ladies'],
      });
    }
  }

  for (const group of MENU_MEN_GROUPS) {
    sections.push({
      slug: group.id,
      label: `Men's ${group.label}`,
      keywords: [
        group.id,
        group.label,
        'men',
        'man',
        'mens',
        "men's",
        'gents',
        'male',
        group.id.includes('traditional') ? 'ethnic men' : 'western men',
      ],
    });
    for (const cat of group.categories) {
      sections.push({
        slug: cat.tag,
        label: cat.label,
        keywords: [cat.tag, cat.label, 'men', 'gents', "men's"],
      });
    }
  }

  return sections;
}

const SECTION_INDEX = buildSectionIndex();

const SYNONYM_ALIASES = [
  { terms: ['kurta', 'kurti', 'kurtis', 'kurtas'], slug: 'kurtas' },
  { terms: ['suit', 'suits', 'suit set'], slug: 'suit sets' },
  { terms: ['saree', 'sari', 'sarees'], slug: 'sarees' },
  { terms: ['lehenga', 'lehengas'], slug: 'lehengas' },
  { terms: ['dupatta', 'dupatta set'], slug: 'dupatta sets' },
  { terms: ['top', 'tunic', 'tunics'], slug: 'tops' },
  { terms: ['dress', 'gown'], slug: 'dresses' },
  { terms: ['co-ord', 'coord', 'co ord', 'coordinate'], slug: 'co-ords' },
  { terms: ['bottom', 'palazzo', 'trouser'], slug: 'bottoms' },
  { terms: ['t-shirt', 'tshirt', 'tee', 'tees'], slug: 't-shirts' },
  { terms: ['men kurta', 'mens kurta', "men's kurta", 'gents kurta', 'kurta'], slug: 'gents kurtas' },
  { terms: ['ethnic co-ord', 'ethnic coord', 'men co-ord ethnic'], slug: 'gents co-ords' },
  { terms: ['jacket', 'jackets', 'denim jacket', 'leather jacket', 'bomber', 'puffer'], slug: 'jackets' },
  { terms: ['wedding blazer', 'ethnic blazer', 'bandhgala'], slug: 'blazers' },
  { terms: ['shirt', 'formal shirt'], slug: 'shirts' },
  { terms: ['men t-shirt', 'mens tshirt', 'polo'], slug: 'gents t-shirts' },
  { terms: ['hoodie', 'sweatshirt'], slug: 'hoodies' },
  { terms: ['track pant', 'trackpant', 'jogger'], slug: 'trackpants' },
  { terms: ['pant', 'chino', 'trouser men'], slug: 'pants' },
  { terms: ['jean', 'denim'], slug: 'jeans' },
  { terms: ['women traditional', 'ladies ethnic', 'ethnic wear women'], slug: 'women-traditional' },
  { terms: ['women western', 'western wear women'], slug: 'women-western' },
  { terms: ['men traditional', 'mens ethnic', 'ethnic wear men'], slug: 'men-traditional' },
  { terms: ['men western', 'western wear men'], slug: 'men-western' },
  { terms: ['traditional', 'ethnic', 'indian wear'], slug: null },
  { terms: ['western', 'casual wear'], slug: null },
];

function normalizeQuery(q) {
  return q.trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreSection(section, query) {
  const slug = section.slug.toLowerCase();
  const label = section.label.toLowerCase();
  let score = 0;

  if (slug === query) score += 100;
  if (label === query) score += 95;
  if (slug.includes(query) || query.includes(slug)) score += 70;
  if (label.includes(query) || query.includes(label)) score += 60;

  for (const kw of section.keywords) {
    const k = String(kw).toLowerCase();
    if (k === query) score += 80;
    if (k.includes(query) || query.includes(k)) score += 40;
  }

  const queryWords = query.split(' ').filter(Boolean);
  for (const word of queryWords) {
    if (slug.includes(word)) score += 15;
    if (label.includes(word)) score += 12;
  }

  return score;
}

function resolveSynonymSlug(query) {
  for (const entry of SYNONYM_ALIASES) {
    for (const term of entry.terms) {
      if (query === term || query.includes(term) || term.includes(query)) {
        return entry.slug;
      }
    }
  }
  return null;
}

function resolveFromProducts(query, products) {
  const matched = products.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const sub = (p.subCategory || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return title.includes(query) || sub.includes(query) || desc.includes(query);
  });

  if (matched.length === 0) return null;

  const counts = new Map();
  for (const p of matched) {
    const sub = (p.subCategory || '').toLowerCase();
    if (!sub) continue;
    counts.set(sub, (counts.get(sub) || 0) + 1);
  }

  let best = null;
  let bestCount = 0;
  for (const [sub, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = sub;
    }
  }
  return best;
}

/**
 * Resolve user search text to a collection slug for navigation.
 * @returns {{ slug: string, label: string, source: string } | null}
 */
export function resolveSearchToCategory(query, products = []) {
  const q = normalizeQuery(query);
  if (!q) return null;

  const synonymSlug = resolveSynonymSlug(q);
  if (synonymSlug) {
    const section = SECTION_INDEX.find((s) => s.slug === synonymSlug);
    return {
      slug: synonymSlug,
      label: section?.label || synonymSlug,
      source: 'synonym',
    };
  }

  if (q.includes('women') && q.includes('traditional')) {
    return { slug: 'women-traditional', label: "Women's Traditional Wear", source: 'phrase' };
  }
  if (q.includes('women') && q.includes('western')) {
    return { slug: 'women-western', label: "Women's Western Wear", source: 'phrase' };
  }
  if ((q.includes('men') || q.includes('gents')) && (q.includes('traditional') || q.includes('ethnic'))) {
    return { slug: 'men-traditional', label: "Men's Traditional Wear", source: 'phrase' };
  }
  if ((q.includes('men') || q.includes('gents')) && q.includes('western')) {
    return { slug: 'men-western', label: "Men's Western Wear", source: 'phrase' };
  }

  let bestSection = null;
  let bestScore = 0;
  for (const section of SECTION_INDEX) {
    const score = scoreSection(section, q);
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  if (bestSection && bestScore >= 40) {
    return { slug: bestSection.slug, label: bestSection.label, source: 'section' };
  }

  const fromProducts = resolveFromProducts(q, products);
  if (fromProducts) {
    const section = SECTION_INDEX.find((s) => s.slug === fromProducts);
    return {
      slug: fromProducts,
      label: section?.label || fromProducts,
      source: 'products',
    };
  }

  return null;
}

/** Section suggestions for autocomplete UI. */
export function getSearchSectionSuggestions(query, products = [], limit = 6) {
  const q = normalizeQuery(query);
  if (!q) return [];

  const scored = SECTION_INDEX.map((section) => ({
    ...section,
    score: scoreSection(section, q),
  }))
    .filter((s) => s.score >= 25)
    .sort((a, b) => b.score - a.score);

  const seen = new Set();
  const out = [];
  for (const s of scored) {
    if (seen.has(s.slug)) continue;
    seen.add(s.slug);
    out.push({ slug: s.slug, label: s.label, score: s.score });
    if (out.length >= limit) break;
  }

  const productSlug = resolveFromProducts(q, products);
  if (productSlug && !seen.has(productSlug)) {
    const section = SECTION_INDEX.find((s) => s.slug === productSlug);
    out.unshift({
      slug: productSlug,
      label: section?.label || productSlug,
      score: 50,
    });
  }

  return out.slice(0, limit);
}

export function filterProductsBySearchQuery(query, products = []) {
  const q = normalizeQuery(query);
  if (!q) return [];

  return products.filter((p) => {
    const title = (p.title || '').toLowerCase();
    const sub = (p.subCategory || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const wear = (p.wearType || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return (
      title.includes(q) ||
      sub.includes(q) ||
      cat.includes(q) ||
      wear.includes(q) ||
      desc.includes(q)
    );
  });
}
