/**
 * Restore primary ad placements only (one ad per section — no stacks).
 *
 * Usage:
 *   node scripts/restore-ad-slots.js
 *   BLOB_READ_WRITE_TOKEN=... node scripts/restore-ad-slots.js --push
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRIMARY_AD_PLACEMENT_KEYS } from '../src/constants/adPlacements.js';
import { encodeAdCode } from '../server/lib/adSlotCode.js';
import { buildGptAdHtml } from '../server/lib/gptAdTemplates.js';
import { savePersistedAdSlots } from '../server/lib/adSlotsPersistence.js';
import { saveAdSlotsToSqlite } from '../server/lib/sqliteDb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, '../server/data/ad-slots.json');
const now = new Date().toISOString();

const slots = PRIMARY_AD_PLACEMENT_KEYS.map((placement, index) => {
  const unit = index % 2 === 0 ? 'a1' : 'a2';
  const html = buildGptAdHtml(placement, { unit });
  return {
    placement,
    code: encodeAdCode(html),
    encoded: true,
    updatedAt: now,
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify(slots, null, 2), 'utf8');
console.log(`Wrote ${slots.length} primary ad slots → ${OUT_PATH}`);

if (process.env.USE_SQLITE === 'true') {
  await saveAdSlotsToSqlite(slots);
  console.log('Synced ad slots into SQLite (products untouched).');
}

if (process.argv.includes('--push')) {
  await savePersistedAdSlots(slots);
  console.log('Pushed ad slots to remote persistence (Blob/Redis).');
}
