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
  loadStoreFromSqlite,
  saveStoreToSqlite,
  useSqlitePersistence,
  getSqliteMode,
  upsertProductInSqlite,
  deleteProductFromSqlite,
} from './sqliteDb.js';
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
      // Never auto-import catalog over saved DB — only seed when store is truly empty locally
      if (!usesRemotePersistence() && !storeCache?.products?.length) {
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
  if (useSqlitePersistence()) return getSqliteMode() === 'turso' ? 'turso-sqlite' : 'sqlite';
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
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

async function loadFromRemote() {
  if (useSqlitePersistence()) {
    const fromSqlite = await loadStoreFromSqlite();
    if (fromSqlite) {
      console.log(`[store] loaded from SQLite (${getSqliteMode()})`);
      return fromSqlite;
    }
    return null;
  }

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
    console.warn('[store] Vercel Blob empty or unavailable — not using stale GitHub copy');
    return null;
  }

  if (useGitHubPersistence()) {
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

function usesRemotePersistence() {
  return useSqlitePersistence() || useRedisPersistence() || useBlobPersistence() || useGitHubPersistence();
}

/** Fresh read before writes — prevents serverless instances from overwriting each other. */
async function readLatestStoreBase() {
  if (usesRemotePersistence()) {
    const remote = await loadFromRemote();
    if (remote) return remote;
  }
  if (canWriteLocalFile()) return loadFromLocal();
  if (storeCache) return structuredClone(storeCache);
  throw new Error('Store not initialized');
}

async function saveToRemote(store) {
  lastPersistError = null;

  if (useSqlitePersistence()) {
    await saveStoreToSqlite(store);
    return;
  }

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
    } else if (useSqlitePersistence()) {
      storeCache = loadFromLocal();
      try {
        await saveStoreToSqlite(storeCache);
        console.log('[store] seeded SQLite from store.json');
      } catch (err) {
        console.warn('[store] sqlite seed failed:', err.message);
      }
    } else {
      storeCache = loadFromLocal();
    }

    storeCache.adSlots =
      useSqlitePersistence() && Array.isArray(storeCache.adSlots) && storeCache.adSlots.length
        ? storeCache.adSlots
        : adSlots !== undefined
          ? adSlots
          : Array.isArray(storeCache.adSlots)
            ? storeCache.adSlots
            : [];

    startBackgroundSeed();

    if (remote || useSqlitePersistence()) {
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

/** Always reload from SQLite / Blob / disk before serving API reads — fixes stale admin + user lists. */
export async function readFreshStore() {
  await initStore();

  try {
    if (usesRemotePersistence()) {
      const remote = await loadFromRemote();
      if (remote) {
        storeCache = structuredClone(remote);
        return structuredClone(remote);
      }
    } else if (canWriteLocalFile()) {
      storeCache = loadFromLocal();
    }
  } catch (err) {
    console.warn('[store] readFreshStore failed:', err.message);
  }

  return readStore();
}

export function invalidateStoreCache() {
  storeCache = null;
  initPromise = null;
}

export async function writeStore(store) {
  const useSqlite = useSqlitePersistence();
  const persisted = useSqlite ? store.adSlots : await loadPersistedAdSlots({ bypassCache: true });
  const keepAds =
    store.adSlots?.length > 0
      ? store.adSlots
      : persisted?.length > 0
        ? persisted
        : storeCache?.adSlots?.length > 0
          ? storeCache.adSlots
          : [];

  store.adSlots = keepAds;
  store._storeUpdatedAt = new Date().toISOString();
  storeCache = structuredClone(store);
  primeAdSlotsCache(keepAds);

  if (!useSqlite) {
    saveToLocal(storeCache);
  }
  await saveToRemote(storeCache);
}

/** Save ad slots from admin — replaces store with filled slots in the save payload */
export async function replaceAdSlots(adSlots) {
  const list = Array.isArray(adSlots) ? adSlots : [];
  await savePersistedAdSlots(list, { allowEmpty: true });
  if (storeCache) {
    storeCache.adSlots = structuredClone(list);
  }
  primeAdSlotsCache(list);
  return list;
}

/** Merge incoming slots into existing — used when saving one slot at a time */
export async function mergeAdSlots(adSlots) {
  const merged = await mergeAndPersistAdSlots(adSlots ?? []);
  if (storeCache) {
    storeCache.adSlots = structuredClone(merged);
  }
  primeAdSlotsCache(merged);
  return merged;
}

export async function updateStore(mutator) {
  await initStore();
  const store = structuredClone(await readLatestStoreBase());
  const next = mutator(store) ?? store;
  await writeStore(next);
  return next;
}

/** Add or update one product — uses SQLite row upsert when available (no product count limit). */
export async function saveSingleProduct(product) {
  await initStore();
  const store = structuredClone(await readLatestStoreBase());
  const idx = store.products.findIndex((p) => p.id === product.id);
  if (idx >= 0) store.products[idx] = product;
  else store.products.unshift(product);
  store._storeUpdatedAt = new Date().toISOString();
  storeCache = structuredClone(store);

  if (useSqlitePersistence()) {
    await upsertProductInSqlite(product);
    return product;
  }

  await writeStore(store);
  return product;
}

/** Remove one product by id. */
export async function removeSingleProduct(productId) {
  await initStore();
  const store = structuredClone(await readLatestStoreBase());
  const before = store.products.length;
  store.products = store.products.filter((p) => p.id !== productId);
  if (store.products.length === before) return false;
  store._storeUpdatedAt = new Date().toISOString();
  storeCache = structuredClone(store);

  if (useSqlitePersistence()) {
    await deleteProductFromSqlite(productId);
    return true;
  }

  await writeStore(store);
  return true;
}
