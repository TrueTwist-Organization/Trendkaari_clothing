import {
  migratePricesInStore,
  countPriceTiers,
} from './productPricing.js';
import { updateStore, readFreshStore } from './store.js';

export async function migrateAllProductPrices({ force = false } = {}) {
  const store = await readFreshStore();

  if (!force) {
    const preview = migratePricesInStore(store);
    if (!preview.migrated) {
      return {
        migrated: false,
        total: store.products?.length || 0,
        counts: countPriceTiers(store.products || []),
      };
    }
  }

  const { store: nextStore, migrated, changedCount, counts } = migratePricesInStore({
    ...store,
    _priceMigrationVersion: force ? 0 : store._priceMigrationVersion,
  });

  if (!migrated) {
    return {
      migrated: false,
      total: store.products?.length || 0,
      counts: countPriceTiers(store.products || []),
    };
  }

  await updateStore((draft) => {
    draft.products = nextStore.products;
    draft._priceMigrationVersion = nextStore._priceMigrationVersion;
    return draft;
  });

  return {
    migrated: true,
    total: nextStore.products?.length || 0,
    changedCount,
    counts,
  };
}
