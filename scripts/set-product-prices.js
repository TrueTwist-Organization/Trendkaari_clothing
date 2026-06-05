#!/usr/bin/env node
/**
 * Set all product prices to fixed tiers: ₹99, ₹149, ₹199, ₹249 only.
 * Updates src/data/products.js and server/data/store.json if present.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const PRICE_TIERS = [99, 149, 199, 249];

function tierFromIndex(index, total) {
  if (total <= 1) return PRICE_TIERS[0];
  const bucket = Math.min(
    PRICE_TIERS.length - 1,
    Math.floor((index / total) * PRICE_TIERS.length)
  );
  return PRICE_TIERS[bucket];
}

function tierFromOldPrice(oldPrice, minOld, maxOld) {
  if (maxOld <= minOld) return PRICE_TIERS[0];
  const ratio = (oldPrice - minOld) / (maxOld - minOld);
  const idx = Math.min(PRICE_TIERS.length - 1, Math.floor(ratio * PRICE_TIERS.length));
  return PRICE_TIERS[idx];
}

function applyPricing(products) {
  const sorted = [...products].sort(
    (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0)
  );
  const minOld = Number(sorted[0]?.price) || 99;
  const maxOld = Number(sorted[sorted.length - 1]?.price) || 249;
  const rankById = new Map(sorted.map((p, i) => [p.id, i]));

  return products.map((p) => {
    const rank = rankById.get(p.id) ?? 0;
    const price = tierFromIndex(rank, products.length);
    const originalPrice = Math.round(price * 2);
    const discountPct = Math.max(1, Math.round((1 - price / originalPrice) * 100));
    return {
      ...p,
      price,
      originalPrice,
      discount: `${discountPct}% OFF`,
    };
  });
}

const { products } = await import('../src/data/products.js');
const updated = applyPricing(products);

const fileBody = `export const products = ${JSON.stringify(updated, null, 2)};\n`;
writeFileSync(PRODUCTS_PATH, fileBody, 'utf8');

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));
  store.products = (store.products || []).map((p) => {
    const next = byId.get(p.id);
    if (!next) return p;
    return {
      ...p,
      price: next.price,
      originalPrice: next.originalPrice,
      discount: next.discount,
    };
  });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

const counts = PRICE_TIERS.reduce((acc, t) => {
  acc[t] = updated.filter((p) => p.price === t).length;
  return acc;
}, {});

console.log(`Updated ${updated.length} products → tiers only: ₹99, ₹149, ₹199, ₹249`);
console.log(counts);
