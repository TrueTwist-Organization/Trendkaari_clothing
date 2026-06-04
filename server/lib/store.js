import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_SITE_SETTINGS } from './siteConfig.js';
import {
  loadStoreFromGitHub,
  saveStoreToGitHub,
  useGitHubPersistence,
} from './githubStore.js';
import { loadStoreFromRedis, saveStoreToRedis, useRedisPersistence } from './redisStore.js';
import {
  loadPersistedAdSlots,
  savePersistedAdSlots,
  resolveStoreAdSlots,
  primeAdSlotsCache,
  mergeAndPersistAdSlots,
} from './adSlotsPersistence.js';
import { ensureSeeded } from './seed.js';
import { syncCatalogFromSource } from './catalog.js';

export { resolveStoreAdSlots };

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
let lastPersistError = null;
let backgroundSeedStarted = false;

function startBackgroundSeed() {
  if (backgroundSeedStarted) return;
  backgroundSeedStarted = true;
  void (async () => {
    try {
      await ensureSeeded();
      if (!storeCache?.products?.length) {
        const result = await syncCatalogFromSource();
        console.log(`[store] Catalog synced: ${result.count} products`);
      }
    } catch (err) {
      console.warn('[store] background seed failed:', err.message);
    }
  })();
}

function useBlobPersistence() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function canWriteLocalFile() {
  return !process.env.VERCEL;
}

export function getPersistenceMode() {
  if (useRedisPersistence()) return 'upstash-redis';
  if (useGitHubPersistence()) return 'github';
  if (useBlobPersistence()) return 'vercel-blob';
  if (canWriteLocalFile()) return 'local-file';
  if (process.env.VERCEL) return 'memory-only';
  return 'local-file';
}

export function getLastPersistError() {
  return lastPersistError;
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
    const { head } = await import('@vercel/blob');
    const meta = await head(BLOB_PATHNAME);
    if (!meta?.url) return null;
    const res = await fetch(meta.url);
    if (!res.ok) return null;
    return JSON.parse(await res.text());
  } catch (err) {
    if (err?.name === 'BlobNotFoundError' || err?.message?.includes('not found')) {
      return null;
    }
    console.warn('[store] blob load failed:', err.message);
    return null;
  }
}

async function saveToBlob(store) {
  if (!useBlobPersistence()) return;
  const { put } = await import('@vercel/blob');
  const mainPayload = { ...store };
  delete mainPayload.adSlots;
  await put(BLOB_PATHNAME, JSON.stringify(mainPayload), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function loadFromRemote() {
  if (useRedisPersistence()) {
    const fromRedis = await loadStoreFromRedis();
    if (fromRedis) {
      console.log('[store] loaded from Upstash Redis');
      return fromRedis;
    }
  }

  if (useBlobPersistence()) {
    const fromBlob = await loadFromBlob();
    if (fromBlob) {
      console.log('[store] loaded from Vercel Blob');
      return fromBlob;
    }
  }

  if (useGitHubPersistence() || process.env.VERCEL) {
    try {
      const fromGitHub = await loadStoreFromGitHub();
      if (fromGitHub) {
        console.log('[store] loaded from GitHub');
        return fromGitHub;
      }
    } catch (err) {
      console.warn('[store] github load failed:', err.message);
    }
  }

  return null;
}

async function saveToRemote(store) {
  lastPersistError = null;

  if (useRedisPersistence()) {
    await saveStoreToRedis(store);
    return;
  }

  if (useGitHubPersistence()) {
    await saveStoreToGitHub(store);
    return;
  }

  if (useBlobPersistence()) {
    await saveToBlob(store);
    return;
  }

  if (process.env.VERCEL) {
    const msg =
      'Live save needs UPSTASH_REDIS_* or GITHUB_TOKEN on Vercel (see .env.example).';
    lastPersistError = msg;
    throw new Error(msg);
  }
}

export async function initStore() {
  if (storeCache) return storeCache;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [remote, adSlots] = await Promise.all([
      loadFromRemote(),
      loadPersistedAdSlots({ bypassCache: true }),
    ]);

    if (remote) {
      storeCache = remote;
    } else {
      storeCache = loadFromLocal();
    }

    storeCache.adSlots =
      adSlots !== undefined ? adSlots : Array.isArray(storeCache.adSlots) ? storeCache.adSlots : [];

    startBackgroundSeed();

    if (remote) {
      return storeCache;
    }

    if (useRedisPersistence()) {
      try {
        await saveStoreToRedis(storeCache);
        console.log('[store] seeded Upstash Redis from store.json');
      } catch (err) {
        console.warn('[store] redis seed failed:', err.message);
      }
    } else if (useBlobPersistence()) {
      try {
        await saveToBlob(storeCache);
        console.log('[store] seeded Vercel Blob from store.json');
      } catch (err) {
        console.warn('[store] blob seed failed:', err.message);
      }
    } else if (useGitHubPersistence()) {
      try {
        await saveStoreToGitHub(storeCache);
        console.log('[store] seeded GitHub from store.json');
      } catch (err) {
        console.warn('[store] github seed failed:', err.message);
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
  const persisted = await loadPersistedAdSlots({ bypassCache: true });
  const keepAds =
    store.adSlots?.length > 0
      ? store.adSlots
      : persisted?.length > 0
        ? persisted
        : storeCache?.adSlots?.length > 0
          ? storeCache.adSlots
          : [];

  store.adSlots = keepAds;
  storeCache = structuredClone(store);
  primeAdSlotsCache(keepAds);

  saveToLocal(storeCache);
  await saveToRemote(storeCache);
}

/** Save ad slots from admin — replaces store with all filled slots in the save payload */
export async function replaceAdSlots(adSlots) {
  await initStore();
  const list = Array.isArray(adSlots) ? adSlots : [];

  if (list.length === 0) {
    const existing = await loadPersistedAdSlots({ bypassCache: true });
    if (existing?.length > 0) {
      throw new Error('Save would remove all ads — reload the admin page and try again.');
    }
  }

  await savePersistedAdSlots(list, { allowEmpty: list.length === 0 });
  storeCache.adSlots = structuredClone(list);
  primeAdSlotsCache(list);
  return list;
}

/** Merge incoming slots into existing — used when saving one slot at a time */
export async function mergeAdSlots(adSlots) {
  await initStore();
  const merged = await mergeAndPersistAdSlots(adSlots ?? []);
  storeCache.adSlots = structuredClone(merged);
  primeAdSlotsCache(merged);
  return merged;
}

export async function updateStore(mutator) {
  await initStore();
  const store = readStore();
  const next = mutator(store) ?? store;
  await writeStore(next);
  return next;
}
