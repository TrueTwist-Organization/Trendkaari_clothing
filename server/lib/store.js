import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SITE_SETTINGS } from './siteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');
const BLOB_PATHNAME = 'trendkaari/store.json';

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
  giftCombos: [],
};

let storeCache = null;
let initPromise = null;

function useBlobPersistence() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function canWriteLocalFile() {
  return !process.env.VERCEL;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadFromLocal() {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = structuredClone(DEFAULT_STORE);
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
}

function saveToLocal(store) {
  if (!canWriteLocalFile()) return;
  ensureDataDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

async function loadFromBlob() {
  if (!useBlobPersistence()) return null;
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'trendkaari/', limit: 20 });
    const match = blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!match?.url) return null;
    const res = await fetch(match.url);
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch (err) {
    console.warn('[store] blob load failed:', err.message);
    return null;
  }
}

async function saveToBlob(store) {
  if (!useBlobPersistence()) return;
  const { put } = await import('@vercel/blob');
  await put(BLOB_PATHNAME, JSON.stringify(store), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function initStore() {
  if (storeCache) return storeCache;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const fromBlob = await loadFromBlob();
    if (fromBlob) {
      storeCache = fromBlob;
      console.log('[store] loaded from Vercel Blob');
      return storeCache;
    }

    storeCache = loadFromLocal();
    if (useBlobPersistence()) {
      try {
        await saveToBlob(storeCache);
        console.log('[store] seeded Vercel Blob from store.json');
      } catch (err) {
        console.warn('[store] blob seed failed:', err.message);
      }
    }
    return storeCache;
  })();

  return initPromise;
}

export function readStore() {
  if (!storeCache) {
    if (canWriteLocalFile()) {
      storeCache = loadFromLocal();
      return structuredClone(storeCache);
    }
    throw new Error('Store not initialized');
  }
  return structuredClone(storeCache);
}

export async function writeStore(store) {
  storeCache = structuredClone(store);
  saveToLocal(storeCache);
  await saveToBlob(storeCache);
}

export async function updateStore(mutator) {
  await initStore();
  const store = readStore();
  const next = mutator(store) ?? store;
  await writeStore(next);
  return next;
}
