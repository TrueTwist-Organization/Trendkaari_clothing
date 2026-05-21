import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import { ensureSeeded } from './lib/seed.js';
import { syncCatalogFromSource } from './lib/catalog.js';
import { readStore } from './lib/store.js';
import { runAutoConfirmJob } from './lib/orderAutoConfirm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/store', storeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'trendkaari-api' });
});

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '../dist');
  app.use(express.static(dist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'));
  });
}

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

const AUTO_CONFIRM_INTERVAL_MS = 15 * 60 * 1000;

function startAutoConfirmScheduler() {
  const tick = () => {
    const n = runAutoConfirmJob();
    if (n > 0) {
      console.log(`[orders] Auto-confirmed ${n} pending order(s)`);
    }
  };
  tick();
  setInterval(tick, AUTO_CONFIRM_INTERVAL_MS);
}

app.listen(PORT, () => {
  console.log(`trendkaari API running on http://localhost:${PORT}`);
  console.log('Admin panel: /admin');
  startAutoConfirmScheduler();
});
