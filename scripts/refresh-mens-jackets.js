#!/usr/bin/env node
/** Force-regenerate PDP copy for men's jackets (proper jacket-specific descriptions). */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyProductDetailDefaults } from '../src/utils/productContent.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.join(ROOT, '../src/data/products.js');
const STORE_PATH = path.join(ROOT, '../server/data/store.json');

const { products } = await import('../src/data/products.js');

let count = 0;
const updated = products.map((p) => {
  if ((p.subCategory || '').toLowerCase() !== 'jackets') return p;
  count += 1;
  return applyProductDetailDefaults({
    ...p,
    description: '',
    descriptionLong: '',
    highlights: {},
    aboutItems: [],
    additionalInfo: {},
  });
});

writeFileSync(
  PRODUCTS_PATH,
  `export const products = ${JSON.stringify(updated, null, 2)};\n`,
  'utf8',
);

if (existsSync(STORE_PATH)) {
  const store = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const byId = new Map(updated.map((p) => [p.id, p]));
  store.products = (store.products || []).map((p) => {
    const next = byId.get(p.id);
    if (!next) return p;
    return {
      ...p,
      title: next.title,
      description: next.description,
      descriptionLong: next.descriptionLong,
      highlights: next.highlights,
      aboutItems: next.aboutItems,
      additionalInfo: next.additionalInfo,
      sizeChart: next.sizeChart,
      sizeChartType: next.sizeChartType,
      rating: next.rating,
      reviewsCount: next.reviewsCount,
    };
  });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

console.log(`Refreshed ${count} men's jacket products.`);
