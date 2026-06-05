#!/usr/bin/env node
import { syncCatalogFromSource } from '../server/lib/catalog.js';

const result = await syncCatalogFromSource();
console.log(`Catalog synced: ${result.count} products in store`);
