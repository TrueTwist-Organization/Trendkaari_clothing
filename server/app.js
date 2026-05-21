import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import { ensureSeeded } from './lib/seed.js';
import { syncCatalogFromSource } from './lib/catalog.js';
import { readStore, initStore, getPersistenceMode } from './lib/store.js';
import { runAutoConfirmJob } from './lib/orderAutoConfirm.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await initStore();
    next();
  } catch (err) {
    console.error('[store] init failed:', err);
    res.status(503).json({ error: 'Store unavailable. Try again shortly.' });
  }
});

app.use('/api/store', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'trendkaari-api',
    persistence: getPersistenceMode(),
    persistWrites: getPersistenceMode() !== 'memory-only',
  });
});

let bootstrapped = false;

async function bootstrapStore() {
  if (bootstrapped) return;
  bootstrapped = true;
  await initStore();
  await ensureSeeded();
  const storeAfterSeed = readStore();
  if (!storeAfterSeed.products?.length) {
    try {
      const result = await syncCatalogFromSource();
      console.log(`[startup] Catalog synced: ${result.count} products`);
    } catch (err) {
      console.warn('[startup] Catalog sync failed:', err.message);
    }
  }
}

app.use(async (req, res, next) => {
  try {
    await bootstrapStore();
    next();
  } catch (err) {
    next(err);
  }
});

const AUTO_CONFIRM_INTERVAL_MS = 15 * 60 * 1000;

export function startAutoConfirmScheduler() {
  const tick = async () => {
    try {
      await initStore();
      const n = await runAutoConfirmJob();
      if (n > 0) {
        console.log(`[orders] Auto-confirmed ${n} pending order(s)`);
      }
    } catch (err) {
      console.warn('[orders] auto-confirm failed:', err.message);
    }
  };
  tick();
  setInterval(tick, AUTO_CONFIRM_INTERVAL_MS);
}

export default app;
