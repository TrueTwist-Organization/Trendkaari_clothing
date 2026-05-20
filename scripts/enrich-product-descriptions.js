#!/usr/bin/env node
/**
 * Add Amazon-style description fields to all catalog products.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const { getProductDetailContent } = await import('../src/utils/productContent.js');
const { products } = await import('../src/data/products.js');

const updated = products.map((p) => {
  const content = getProductDetailContent(p);
  return {
    ...p,
    description: content.descriptionLong,
    descriptionLong: content.descriptionLong,
    highlights: content.highlights,
    aboutItems: content.aboutItems,
    additionalInfo: content.additionalInfo,
    sizeChart: content.sizeChart,
    sizeChartType: content.sizeChartType,
  };
});

writeFileSync(PRODUCTS_PATH, `export const products = ${JSON.stringify(updated, null, 2)};\n`, 'utf8');

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));
  store.products = (store.products || []).map((p) => {
    const next = byId.get(p.id);
    if (!next) return p;
    return {
      ...p,
      description: next.description,
      descriptionLong: next.descriptionLong,
      highlights: next.highlights,
      aboutItems: next.aboutItems,
      additionalInfo: next.additionalInfo,
      sizeChart: next.sizeChart,
      sizeChartType: next.sizeChartType,
    };
  });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`Enriched ${updated.length} products with Amazon-style descriptions`);
