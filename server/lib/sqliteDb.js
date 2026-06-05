import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';
import { DEFAULT_SITE_SETTINGS } from './siteConfig.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = path.join(__dirname, '../data/trendkaari.db');

const DEFAULT_COUPONS = [
  { code: 'SALE100', discount: 20, discountType: 'flat', minPurchase: 199 },
  { code: 'FESTIVE50', discount: 50, discountType: 'flat', minPurchase: 249 },
  { code: 'FFLAT30', discount: 30, discountType: 'flat', minPurchase: 149 },
];

let client = null;
let schemaReady = false;

export function useSqlitePersistence() {
  if (process.env.USE_SQLITE === 'false') return false;
  if (process.env.TURSO_DATABASE_URL?.trim()) return true;
  if (process.env.SQLITE_PATH?.trim()) return true;
  if (process.env.USE_SQLITE === 'true') return true;
  return false;
}

export function getSqliteMode() {
  if (process.env.TURSO_DATABASE_URL?.trim()) return 'turso';
  return 'local-file';
}

function getDbPath() {
  const custom = process.env.SQLITE_PATH?.trim();
  if (custom) return path.isAbsolute(custom) ? custom : path.join(process.cwd(), custom);
  return DEFAULT_DB_PATH;
}

function getClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL?.trim() || `file:${getDbPath()}`;
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
    client = createClient({
      url,
      ...(authToken ? { authToken } : {}),
    });
  }
  return client;
}

async function ensureSchema() {
  if (schemaReady) return;
  const db = getClient();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gift_combos (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
  `);
  schemaReady = true;
}

function parseRowData(row, field = 'data') {
  try {
    return JSON.parse(row[field]);
  } catch {
    return null;
  }
}

function chunkStatements(stmts, size = 150) {
  const chunks = [];
  for (let i = 0; i < stmts.length; i += size) {
    chunks.push(stmts.slice(i, i + size));
  }
  return chunks;
}

export async function loadStoreFromSqlite() {
  await ensureSchema();
  const db = getClient();

  const [productsRes, ordersRes, usersRes, couponsRes, combosRes, metaRes] = await Promise.all([
    db.execute('SELECT data FROM products ORDER BY id ASC'),
    db.execute('SELECT data FROM orders'),
    db.execute('SELECT data FROM users'),
    db.execute('SELECT data FROM coupons'),
    db.execute('SELECT data FROM gift_combos'),
    db.execute('SELECT key, data FROM app_meta'),
  ]);

  const meta = {};
  for (const row of metaRes.rows) {
    meta[row.key] = parseRowData(row);
  }

  const products = productsRes.rows.map((row) => parseRowData(row)).filter(Boolean);
  const hasData =
    products.length > 0 ||
    ordersRes.rows.length > 0 ||
    usersRes.rows.length > 0 ||
    meta.admin != null;

  if (!hasData) return null;

  return {
    products,
    orders: ordersRes.rows.map((row) => parseRowData(row)).filter(Boolean),
    users: usersRes.rows.map((row) => parseRowData(row)).filter(Boolean),
    coupons: couponsRes.rows.length
      ? couponsRes.rows.map((row) => parseRowData(row)).filter(Boolean)
      : structuredClone(DEFAULT_COUPONS),
    giftCombos: combosRes.rows.map((row) => parseRowData(row)).filter(Boolean),
    admin: meta.admin ?? null,
    settings: meta.settings ?? { ...DEFAULT_SITE_SETTINGS },
    adSlots: Array.isArray(meta.adSlots) ? meta.adSlots : [],
    _storeUpdatedAt: meta._storeUpdatedAt ?? null,
  };
}

export async function saveStoreToSqlite(store) {
  await ensureSchema();
  const db = getClient();

  const products = store.products || [];
  const orders = store.orders || [];
  const users = store.users || [];
  const coupons = store.coupons || DEFAULT_COUPONS;
  const giftCombos = store.giftCombos || [];

  const stmts = [
    { sql: 'DELETE FROM products' },
    ...products.map((p) => ({
      sql: 'INSERT INTO products (id, data) VALUES (?, ?)',
      args: [Number(p.id), JSON.stringify(p)],
    })),
    { sql: 'DELETE FROM orders' },
    ...orders.map((o) => ({
      sql: 'INSERT INTO orders (id, data) VALUES (?, ?)',
      args: [String(o.id), JSON.stringify(o)],
    })),
    { sql: 'DELETE FROM users' },
    ...users.map((u) => ({
      sql: 'INSERT INTO users (id, data) VALUES (?, ?)',
      args: [String(u.id), JSON.stringify(u)],
    })),
    { sql: 'DELETE FROM coupons' },
    ...coupons.map((c) => ({
      sql: 'INSERT INTO coupons (code, data) VALUES (?, ?)',
      args: [String(c.code), JSON.stringify(c)],
    })),
    { sql: 'DELETE FROM gift_combos' },
    ...giftCombos.map((c) => ({
      sql: 'INSERT INTO gift_combos (id, data) VALUES (?, ?)',
      args: [String(c.id), JSON.stringify(c)],
    })),
    {
      sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
      args: ['admin', JSON.stringify(store.admin ?? null)],
    },
    {
      sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
      args: ['settings', JSON.stringify(store.settings ?? DEFAULT_SITE_SETTINGS)],
    },
  ];

  if ('adSlots' in store) {
    stmts.push({
      sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
      args: ['adSlots', JSON.stringify(store.adSlots ?? [])],
    });
  }

  stmts.push({
    sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
    args: ['_storeUpdatedAt', JSON.stringify(store._storeUpdatedAt || new Date().toISOString())],
  });

  for (const chunk of chunkStatements(stmts)) {
    await db.batch(chunk, 'write');
  }
}

export async function saveAdSlotsToSqlite(adSlots) {
  await ensureSchema();
  const db = getClient();
  await db.execute({
    sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
    args: ['adSlots', JSON.stringify(Array.isArray(adSlots) ? adSlots : [])],
  });
}

async function touchStoreUpdatedAt(db) {
  await db.execute({
    sql: 'INSERT OR REPLACE INTO app_meta (key, data) VALUES (?, ?)',
    args: ['_storeUpdatedAt', JSON.stringify(new Date().toISOString())],
  });
}

export async function upsertProductInSqlite(product) {
  await ensureSchema();
  const db = getClient();
  await db.batch(
    [
      {
        sql: 'INSERT OR REPLACE INTO products (id, data) VALUES (?, ?)',
        args: [Number(product.id), JSON.stringify(product)],
      },
    ],
    'write'
  );
  await touchStoreUpdatedAt(db);
}

export async function deleteProductFromSqlite(productId) {
  await ensureSchema();
  const db = getClient();
  await db.batch([{ sql: 'DELETE FROM products WHERE id = ?', args: [Number(productId)] }], 'write');
  await touchStoreUpdatedAt(db);
}

export async function importJsonStoreToSqlite(jsonStore) {
  await saveStoreToSqlite(jsonStore);
  return loadStoreFromSqlite();
}
