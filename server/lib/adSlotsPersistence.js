import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { useRedisPersistence } from './redisStore.js';
import { useSqlitePersistence, loadStoreFromSqlite } from './sqliteDb.js';
import { getDefaultAdSlots } from './defaultAdSlots.js';
import { isValidAdSlot, sanitizeAdSlotList } from './adSlotValidation.js';

const MAX_SAVED_AD_SLOTS = 30;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_AD_SLOTS_PATH = path.join(__dirname, '../data/ad-slots.json');

const BLOB_PATHNAME = 'trendkaari/ad-slots.json';
const REDIS_KEY = 'trendkaari:ad-slots:v1';

function useBlobPersistence() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function canWriteLocalFile() {
  return !process.env.VERCEL;
}

/** In-memory cache — only set after a successful read or write */
let memCache = null;
let memCacheLoaded = false;

export function primeAdSlotsCache(adSlots) {
  memCache = Array.isArray(adSlots) ? adSlots : [];
  memCacheLoaded = true;
}

export function mergeAdSlotRecords(existing = [], incoming = []) {
  const map = new Map();
  (existing || []).forEach((slot) => {
    if (slot?.placement && String(slot.code || '').trim()) {
      map.set(slot.placement, slot);
    }
  });
  (incoming || []).forEach((slot) => {
    if (slot?.placement && String(slot.code || '').trim()) {
      map.set(slot.placement, slot);
    }
  });
  return [...map.values()];
}

async function readFromBlob() {
  const { head } = await import('@vercel/blob');
  const meta = await head(BLOB_PATHNAME);
  if (!meta?.url) return [];
  const res = await fetch(meta.url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`blob fetch failed (${res.status})`);
  }
  const parsed = JSON.parse(await res.text());
  return Array.isArray(parsed) ? parsed : [];
}

async function readFromRedis() {
  const { Redis } = await import('@upstash/redis');
  const redis = Redis.fromEnv();
  const data = await redis.get(REDIS_KEY);
  if (data === null || data === undefined) return [];
  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  return Array.isArray(parsed) ? parsed : [];
}

async function readFromDisk() {
  if (!fs.existsSync(LOCAL_AD_SLOTS_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(LOCAL_AD_SLOTS_PATH, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

/** Default slots shipped in repo — used when production blob/redis is still empty. */
function readBundledAdSlots() {
  const imported = getDefaultAdSlots();
  if (imported.length) return imported;

  try {
    if (!fs.existsSync(LOCAL_AD_SLOTS_PATH)) return [];
    const parsed = JSON.parse(fs.readFileSync(LOCAL_AD_SLOTS_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readFromSqliteMeta() {
  if (!useSqlitePersistence()) return [];
  const store = await loadStoreFromSqlite();
  return Array.isArray(store?.adSlots) ? store.adSlots : [];
}

/** Merge bundled defaults under saved slots — valid saved codes win, gaps get defaults. */
async function mergeWithBundledDefaults(list = []) {
  const bundled = readBundledAdSlots();
  const validSaved = sanitizeAdSlotList(list);
  return mergeAdSlotRecords(bundled, validSaved);
}

/** If remote storage has corrupt/partial/bloated ads, rewrite with bundled defaults. */
async function healAdSlotsIfNeeded(rawList = []) {
  const valid = sanitizeAdSlotList(rawList);
  const bundled = readBundledAdSlots();

  if (valid.length > MAX_SAVED_AD_SLOTS) {
    if (useRedisPersistence() || useBlobPersistence()) {
      try {
        await savePersistedAdSlots(bundled, { allowEmpty: false });
        console.log(`[ad-slots] trimmed bloated storage (${valid.length} → ${bundled.length} slots)`);
      } catch (err) {
        console.warn('[ad-slots] trim save failed:', err.message);
      }
    }
    return bundled;
  }

  const merged = mergeAdSlotRecords(bundled, valid);
  const needsHeal = valid.length < merged.length;

  if (!needsHeal) return valid.length ? valid : merged;

  if (useRedisPersistence() || useBlobPersistence()) {
    try {
      await savePersistedAdSlots(merged, { allowEmpty: false });
      console.log(`[ad-slots] healed remote storage (${valid.length} → ${merged.length} slots)`);
    } catch (err) {
      console.warn('[ad-slots] heal save failed:', err.message);
    }
  }

  return merged;
}

/** Load ad slots from durable storage. Returns [] only when file/key truly empty. */
export async function loadPersistedAdSlots({ bypassCache = false, skipHeal = false } = {}) {
  if (!bypassCache && memCacheLoaded) {
    return memCache ?? [];
  }

  try {
    let list = [];
    if (useSqlitePersistence()) {
      list = sanitizeAdSlotList(await readFromSqliteMeta());
      list = await mergeWithBundledDefaults(list);
    } else if (useRedisPersistence()) {
      list = await readFromRedis();
      list = skipHeal ? sanitizeAdSlotList(list) : await healAdSlotsIfNeeded(list);
    } else if (useBlobPersistence()) {
      try {
        list = await readFromBlob();
      } catch (err) {
        if (err?.name === 'BlobNotFoundError' || /not found/i.test(err?.message || '')) {
          list = [];
        } else {
          throw err;
        }
      }
      list = skipHeal ? sanitizeAdSlotList(list) : await healAdSlotsIfNeeded(list);
    } else if (canWriteLocalFile()) {
      list = await mergeWithBundledDefaults(await readFromDisk());
    } else {
      return memCacheLoaded ? (memCache ?? []) : undefined;
    }

    memCache = list;
    memCacheLoaded = true;
    return list;
  } catch (err) {
    console.warn('[ad-slots] load failed:', err.message);
    if (memCacheLoaded) return memCache ?? [];
    return undefined;
  }
}

export async function savePersistedAdSlots(adSlots, { allowEmpty = false } = {}) {
  const list = Array.isArray(adSlots) ? adSlots : [];

  if (!allowEmpty && list.length === 0) {
    const existing = await loadPersistedAdSlots({ bypassCache: true, skipHeal: true });
    if (existing?.length > 0) {
      throw new Error('Refusing to wipe saved ad slots — reload admin and try again.');
    }
  }

  const payload = JSON.stringify(list);
  memCache = list;
  memCacheLoaded = true;

  if (useRedisPersistence()) {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.set(REDIS_KEY, payload);
    return list;
  }

  if (useBlobPersistence()) {
    const { put } = await import('@vercel/blob');
    await put(BLOB_PATHNAME, payload, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 0,
    });
    return list;
  }

  if (canWriteLocalFile()) {
    const dir = path.dirname(LOCAL_AD_SLOTS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_AD_SLOTS_PATH, payload, 'utf8');
    return list;
  }

  throw new Error('Ad slot persistence is not configured on this server.');
}

/** Always read fresh from durable storage for public/admin APIs */
export async function resolveStoreAdSlots(fallback = [], { includeDefaults = true } = {}) {
  const persisted = await loadPersistedAdSlots({ bypassCache: true });

  if (persisted !== undefined && persisted.length > 0) {
    return sanitizeAdSlotList(persisted);
  }

  if (includeDefaults) {
    const defaults = sanitizeAdSlotList(getDefaultAdSlots());
    if (defaults.length) return defaults;
  }

  if (memCacheLoaded && memCache?.length) return sanitizeAdSlotList(memCache);
  return sanitizeAdSlotList(Array.isArray(fallback) ? fallback : []);
}

export async function mergeAndPersistAdSlots(incoming = []) {
  const existing = (await loadPersistedAdSlots({ bypassCache: true })) ?? [];
  const merged = mergeAdSlotRecords(existing, incoming);

  if (merged.length === 0 && existing.length > 0 && incoming.length === 0) {
    throw new Error('Save would remove all ads — reload the admin page and try again.');
  }

  await savePersistedAdSlots(merged);
  return merged;
}
