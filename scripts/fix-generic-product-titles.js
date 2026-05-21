#!/usr/bin/env node
/**
 * Replace generic numbered titles with unique product names by category folder.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const LADIES_KURTA_BY_FOLDER = {
  1: 'Ivory Gold Yoke Embroidered Straight Kurta',
  2: 'Teal Blue Printed A-Line Cotton Kurta',
  3: 'Mustard Floral Threadwork Festive Kurta',
  4: 'Wine Maroon Silk Blend Anarkali Kurta',
  5: 'Sky Blue Geometric Print Straight Kurta',
  6: 'Emerald Green Hand-Block Cotton Kurta',
  7: 'Chocolate Brown Straight Cotton Kurta',
  8: 'Blush Pink Floral Muslin Kurta',
  9: 'Ruby Red Festive Embroidered Kurta',
  10: 'Lavender Pastel Printed Layered Kurta',
};

const LEHENGA_BY_FOLDER = {
  1: 'Royal Maroon Zari Embroidered Bridal Lehenga',
  2: 'Lavanya Peach Mirror Work Festive Lehenga',
  3: 'Emerald Green Silk Banarasi Lehenga Choli',
  4: 'Midnight Blue Sequin Party Wear Lehenga',
  5: 'Blush Pink Organza Floral Lehenga Set',
  6: 'Gold Tissue Reception Lehenga with Dupatta',
  7: 'Wine Velvet A-Line Festive Lehenga',
  8: 'Teal Georgette Threadwork Lehenga',
  9: 'Ivory Cream Net Embroidered Lehenga',
  10: 'Coral Orange Bandhani Print Lehenga',
};

const SAREE_BY_FOLDER = {
  1: 'Banarasi Gold Border Silk Saree',
  2: 'Kanjivaram Temple Border Silk Saree',
  3: 'Pastel Green Chanderi Cotton Saree',
  4: 'Red Bandhani Georgette Saree',
  5: 'Navy Blue Printed Linen Saree',
  6: 'Mauve Organza Floral Saree',
  7: 'Black Gold Zari Party Wear Saree',
  8: 'Mustard Handloom Cotton Saree',
  9: 'Peach Tissue Embroidered Saree',
  10: 'Multicolor Ikat Silk Blend Saree',
};

const SUIT_SET_BY_FOLDER = {
  1: 'Ivory Embroidered Palazzo Suit Set',
  2: 'Sage Green Printed Sharara Suit Set',
  3: 'Rust Orange Georgette Anarkali Suit Set',
  4: 'Powder Blue Chanderi Three-Piece Suit',
  5: 'Magenta Silk Straight Kurta Suit Set',
  6: 'Olive Green Cotton Kurta Pant Set',
  7: 'Lavender Mirror Work Festive Suit Set',
  8: 'Charcoal Grey Embroidered Salwar Suit Set',
  9: 'Yellow Floral Muslin Co-ord Suit Set',
  10: 'Wine Maroon Velvet Party Suit Set',
};

const TITLE_RULES = [
  {
    pattern: /^Premium Designer Kurta (\d+)$/i,
    map: LADIES_KURTA_BY_FOLDER,
    pathRe: /\/Kurtas\/(\d+)\//i,
    fallbackPathRe: /\/kurtas\/[^/]+\/(\d+)\//i,
  },
  {
    pattern: /^Exquisite Designer Lehenga (\d+)$/i,
    map: LEHENGA_BY_FOLDER,
    pathRe: /\/Lehengas\/(\d+)\//i,
    fallbackPathRe: /\/lehengas\/[^/]+\/(\d+)\//i,
  },
  {
    pattern: /^Elegant Silk Saree (\d+)$/i,
    map: SAREE_BY_FOLDER,
    pathRe: /\/Sarees\/(\d+)\//i,
    fallbackPathRe: /\/sarees\/[^/]+\/(\d+)\//i,
  },
  {
    pattern: /^Embroidered Suit Set (\d+)$/i,
    map: SUIT_SET_BY_FOLDER,
    pathRe: /\/Suit Sets\/(\d+)\//i,
    fallbackPathRe: /\/suit-sets\/[^/]+\/(\d+)\//i,
  },
];

function folderFromProduct(p, rule) {
  const src = p.image || p.images?.[0] || '';
  const m =
    String(src).match(rule.pathRe) || String(src).match(rule.fallbackPathRe);
  return m ? Number(m[1]) : null;
}

function newTitleForProduct(p) {
  for (const rule of TITLE_RULES) {
    const m = String(p.title || '').match(rule.pattern);
    if (!m) continue;
    const folder = folderFromProduct(p, rule) ?? Number(m[1]);
    const title = rule.map[folder];
    if (title) return { oldTitle: p.title, newTitle: title };
  }
  return null;
}

function replaceTitleInValue(val, oldTitle, newTitle) {
  if (typeof val === 'string') {
    return val.split(oldTitle).join(newTitle);
  }
  if (Array.isArray(val)) {
    return val.map((item) => replaceTitleInValue(item, oldTitle, newTitle));
  }
  if (val && typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) {
      out[k] = replaceTitleInValue(v, oldTitle, newTitle);
    }
    return out;
  }
  return val;
}

function renameProduct(p) {
  const match = newTitleForProduct(p);
  if (!match) return { product: p, changed: false };
  const { oldTitle, newTitle } = match;
  const next = replaceTitleInValue({ ...p, title: newTitle }, oldTitle, newTitle);
  return { product: next, changed: true, oldTitle, newTitle };
}

const genericPatterns = TITLE_RULES.map((r) => r.pattern);

function isGenericTitle(title) {
  return genericPatterns.some((re) => re.test(String(title || '')));
}

const { products } = await import('../src/data/products.js');
let changed = 0;
const updated = products.map((p) => {
  const { product, changed: did, oldTitle, newTitle } = renameProduct(p);
  if (did) {
    changed += 1;
    console.log(`  ${oldTitle} → ${newTitle}`);
  }
  return product;
});

writeFileSync(
  PRODUCTS_PATH,
  `export const products = ${JSON.stringify(updated, null, 2)};\n`,
  'utf8',
);

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));

  function syncProduct(p) {
    const next = byId.get(p.id);
    if (!next || !isGenericTitle(p.title)) return p;
    return replaceTitleInValue({ ...p, title: next.title }, p.title, next.title);
  }

  store.products = (store.products || []).map(syncProduct);

  if (Array.isArray(store.orders)) {
    store.orders = store.orders.map((order) => {
      if (!order?.items) return order;
      return {
        ...order,
        items: order.items.map((item) => {
          const next = byId.get(item.productId ?? item.id);
          if (!next || !isGenericTitle(item.title)) return item;
          return replaceTitleInValue(
            { ...item, title: next.title },
            item.title,
            next.title,
          );
        }),
      };
    });
  }

  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`\nRenamed ${changed} products.`);
