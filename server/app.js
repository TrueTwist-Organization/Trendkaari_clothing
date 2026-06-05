import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import storeRoutes from './routes/store.js';
import {
  initStore,
  getPersistenceMode,
  getLastPersistError,
  canPersistWrites,
  resolveStoreAdSlots,
  readStore,
} from './lib/store.js';
import { useRemoteMediaUpload } from './lib/blobStorage.js';
import { isAdminManagedProduct } from './lib/catalog.js';
import { getActiveAdSlots } from './lib/siteConfig.js';
import { runAutoConfirmJob } from './lib/orderAutoConfirm.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'flexfit-admin-secret-change-in-production';

/** Fast session check — does not load the ~1MB store blob */
app.get('/api/admin/auth/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const admin = jwt.verify(token, JWT_SECRET);
    res.json({
      admin: { email: admin.email, name: admin.name || 'Admin' },
    });
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

function isFastReadPath(req) {
  const path = req.path || '';
  if (req.method !== 'GET') return false;
  if (path === '/api/health') return true;
  if (path.endsWith('/auth/me')) return true;
  if (path === '/api/store/ad-slots') return true;
  return false;
}

/** Ad slot reads/writes use dedicated blob storage — skip loading the full store blob. */
function isAdSlotsPath(req) {
  const path = req.path || '';
  return path.endsWith('/ad-slots') || path.includes('/ad-slots');
}

app.use(async (req, res, next) => {
  if (isFastReadPath(req) || isAdSlotsPath(req)) return next();
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

app.get('/api/health', async (_req, res) => {
  let activeAdSlots = 0;
  try {
    await initStore();
    const adSlots = await resolveStoreAdSlots();
    activeAdSlots = getActiveAdSlots({ adSlots }).length;
  } catch {
    activeAdSlots = 0;
  }
  let productCount = 0;
  let adminProductCount = 0;
  let storeUpdatedAt = null;
  try {
    const store = readStore();
    productCount = store.products?.length || 0;
    adminProductCount = (store.products || []).filter(isAdminManagedProduct).length;
    storeUpdatedAt = store._storeUpdatedAt || null;
  } catch {
    /* store may not be ready */
  }

  res.json({
    ok: true,
    service: 'trendkaari-api',
    persistence: getPersistenceMode(),
    persistWrites: canPersistWrites(),
    mediaUploadReady: useRemoteMediaUpload() || !process.env.VERCEL,
    activeAdSlots,
    productCount,
    adminProductCount,
    storeUpdatedAt,
    lastPersistError: getLastPersistError(),
  });
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
