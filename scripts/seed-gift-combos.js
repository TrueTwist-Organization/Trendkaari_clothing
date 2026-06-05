/**
 * One-time: write default gift combos into server/data/store.json
 * Run: node scripts/seed-gift-combos.js
 */
import { readStore, updateStore } from '../server/lib/store.js';
import { DEFAULT_GIFT_COMBOS, normalizeGiftCombo } from '../server/lib/giftCombos.js';

const store = readStore();
if (Array.isArray(store.giftCombos) && store.giftCombos.length > 0) {
  console.log(`Store already has ${store.giftCombos.length} gift combo(s). Skipping seed.`);
  process.exit(0);
}

updateStore((s) => {
  s.giftCombos = DEFAULT_GIFT_COMBOS.map((c, i) => normalizeGiftCombo(c, i));
  return s;
});

console.log(`Seeded ${DEFAULT_GIFT_COMBOS.length} gift combos into store.json`);
