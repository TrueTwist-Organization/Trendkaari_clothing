#!/usr/bin/env node
/**
 * Set all product prices to fixed tiers: ₹99, ₹129, ₹139, ₹149 only.
 * Prices rotate within each sub-category so no category shares one price.
 * Updates src/data/products.js and server/data/store.json if present.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  PRICE_TIERS,
  applyCatalogPricing,
  countPriceTiers,
} from '../server/lib/productPricing.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const { products } = await import('../src/data/products.js');
const updated = applyCatalogPricing(products);

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
  store._priceMigrationVersion = 2;
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`Updated ${updated.length} products → tiers only: ₹99, ₹129, ₹139, ₹149`);
console.log(countPriceTiers(updated));
