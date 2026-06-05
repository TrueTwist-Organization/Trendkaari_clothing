/**
 * One-time migration: server/data/store.json → SQLite (server/data/trendkaari.db)
 *
 * Usage:
 *   USE_SQLITE=true node scripts/migrate-store-to-sqlite.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { importJsonStoreToSqlite } from '../server/lib/sqliteDb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, '../server/data/store.json');

async function main() {
  if (!fs.existsSync(STORE_PATH)) {
    console.error('store.json not found at', STORE_PATH);
    process.exit(1);
  }

  const store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  console.log(`Importing ${store.products?.length || 0} products, ${store.orders?.length || 0} orders…`);

  const saved = await importJsonStoreToSqlite(store);
  console.log('SQLite migration complete.');
  console.log(`  products: ${saved.products.length}`);
  console.log(`  orders: ${saved.orders.length}`);
  console.log(`  users: ${saved.users.length}`);
  console.log(`  gift combos: ${saved.giftCombos.length}`);
  console.log('\nNext: add USE_SQLITE=true to your .env and restart npm run dev');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
