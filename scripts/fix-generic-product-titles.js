#!/usr/bin/env node
/**
 * Replace generic numbered titles (e.g. "Premium Designer Kurta 7") with unique names.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

/** Folder index from image path: /kurtas/Kurtas/7/... */
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

const GENERIC_KURTA = /^Premium Designer Kurta (\d+)$/i;

function folderFromProduct(p) {
  const src = p.image || p.images?.[0] || '';
  const m = String(src).match(/\/Kurtas\/(\d+)\//i) || String(src).match(/\/kurtas\/[^/]+\/(\d+)\//i);
  return m ? Number(m[1]) : null;
}

function newTitleForProduct(p) {
  const m = String(p.title || '').match(GENERIC_KURTA);
  if (!m) return null;
  const folder = folderFromProduct(p) ?? Number(m[1]);
  return LADIES_KURTA_BY_FOLDER[folder] || null;
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
  const newTitle = newTitleForProduct(p);
  if (!newTitle) return { product: p, changed: false };
  const oldTitle = p.title;
  const next = replaceTitleInValue({ ...p, title: newTitle }, oldTitle, newTitle);
  return { product: next, changed: true, oldTitle, newTitle };
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

writeFileSync(PRODUCTS_PATH, `export const products = ${JSON.stringify(updated, null, 2)};\n`, 'utf8');

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));
  store.products = (store.products || []).map((p) => {
    const next = byId.get(p.id);
    if (!next) return p;
    const oldTitle = p.title;
    if (!GENERIC_KURTA.test(oldTitle)) return { ...p, title: next.title };
    return replaceTitleInValue({ ...p, title: next.title }, oldTitle, next.title);
  });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`\nRenamed ${changed} products.`);
