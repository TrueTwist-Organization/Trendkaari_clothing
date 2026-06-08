#!/usr/bin/env node
/**
 * Set all product prices to fixed tiers: ₹99, ₹129, ₹139, ₹149 only.
 * Prices rotate within each sub-category so no category shares one price.
 * Updates src/data/products.js and server/data/store.json if present.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const PRICE_TIERS = [99, 129, 139, 149];

function categoryKey(product) {
  return (product.subCategory || product.category || 'other').toLowerCase().trim();
}

function applyPricing(products) {
  const groups = new Map();

  for (const product of products) {
    const key = categoryKey(product);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(product);
  }

  const priceById = new Map();

  for (const [key, group] of groups) {
    const sorted = [...group].sort((a, b) => Number(a.id) - Number(b.id));
    const offset = Math.abs(key.split('').reduce((n, c) => n + c.charCodeAt(0), 0)) % PRICE_TIERS.length;

    sorted.forEach((product, index) => {
      const tierIdx = (offset + index) % PRICE_TIERS.length;
      priceById.set(product.id, PRICE_TIERS[tierIdx]);
    });
  }

  return products.map((product) => {
    const price = priceById.get(product.id) ?? PRICE_TIERS[0];
    const originalPrice = Math.round(price * 2);
    const discountPct = Math.max(1, Math.round((1 - price / originalPrice) * 100));

    return {
      ...product,
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

const counts = PRICE_TIERS.reduce((acc, tier) => {
  acc[tier] = updated.filter((p) => p.price === tier).length;
  return acc;
}, {});

console.log(`Updated ${updated.length} products → tiers only: ₹99, ₹129, ₹139, ₹149`);
console.log(counts);
