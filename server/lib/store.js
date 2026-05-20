import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SITE_SETTINGS } from './siteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const DEFAULT_STORE = {
  products: [],
  orders: [],
  users: [],
  coupons: [
    { code: 'SALE100', discount: 20, discountType: 'flat', minPurchase: 199 },
    { code: 'FESTIVE50', discount: 50, discountType: 'flat', minPurchase: 249 },
    { code: 'FFLAT30', discount: 30, discountType: 'flat', minPurchase: 149 },
  ],
  admin: null,
  settings: { ...DEFAULT_SITE_SETTINGS },
  adSlots: [],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readStore() {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    writeStore(DEFAULT_STORE);
    return structuredClone(DEFAULT_STORE);
  }
  const raw = fs.readFileSync(STORE_PATH, 'utf8');
  return JSON.parse(raw);
}

export function writeStore(store) {
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export function updateStore(mutator) {
  const store = readStore();
  const next = mutator(store) ?? store;
  writeStore(next);
  return next;
}
