import { Router } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  readStore,
  readFreshStore,
  updateStore,
  saveSingleProduct,
  removeSingleProduct,
  replaceAdSlots,
  mergeAdSlots,
  resolveStoreAdSlots,
  canPersistWrites,
  getPersistenceMode,
  getLastPersistError,
} from '../lib/store.js';
import { useRemoteMediaUpload } from '../lib/blobStorage.js';
import { nextAdminProductId } from '../lib/productIds.js';
import { syncAdminCredentials, getAdminCredentials } from '../lib/seed.js';
import { syncCatalogFromSource } from '../lib/catalog.js';
import { saveUploadedProductImages } from '../lib/imageProcess.js';
import { enrichProductRecord } from '../lib/enrichProduct.js';
import { requireAdmin, signAdminToken } from '../middleware/auth.js';
import { autoConfirmExpiredPendingOrders } from '../lib/orderAutoConfirm.js';
import {
  mergeSiteSettings,
  getStoreSettings,
  getAdSlotsForAdmin,
  buildAdSlotsFromPayload,
} from '../lib/siteConfig.js';
import {
  getAdminGiftCombos,
  seedGiftCombosIfEmpty,
  buildGiftComboFromBody,
  validateGiftCombo,
  DEFAULT_GIFT_COMBOS,
} from '../lib/giftCombos.js';
import { saveComboImages } from '../lib/comboImage.js';
import { createImageUpload, handleMultipartUpload, shouldUseMemoryUpload } from '../lib/uploadMiddleware.js';
import { mergeUploadedProductImages, normalizeProductImages } from '../lib/productImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../public/product-media');
const COMBO_UPLOAD_DIR = path.join(__dirname, '../../public/combos');
if (!shouldUseMemoryUpload()) {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  if (!fs.existsSync(COMBO_UPLOAD_DIR)) {
    fs.mkdirSync(COMBO_UPLOAD_DIR, { recursive: true });
  }
}

const upload = createImageUpload({ dest: UPLOAD_DIR, maxFiles: 30 });
const uploadProductImages = handleMultipartUpload(upload, 'images', 30);
const uploadComboImages = handleMultipartUpload(
  createImageUpload({ dest: COMBO_UPLOAD_DIR }),
  'images',
  8
);

const router = Router();

function writableStoreResponse() {
  return {
    error:
      'Admin saves are disabled on this server. In Vercel → Settings → Environment Variables, add BLOB_READ_WRITE_TOKEN (or Upstash Redis / Turso), then redeploy.',
    persistence: getPersistenceMode(),
    persistWrites: false,
  };
}

function requireWritableStore(req, res, next) {
  if (!canPersistWrites()) {
    return res.status(503).json(writableStoreResponse());
  }
  next();
}

router.get('/system/status', requireAdmin, async (_req, res) => {
  try {
    await readFreshStore();
    res.json({
      ok: true,
      persistence: getPersistenceMode(),
      persistWrites: canPersistWrites(),
      mediaUploadReady: useRemoteMediaUpload() || !process.env.VERCEL,
      lastPersistError: getLastPersistError(),
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      persistence: getPersistenceMode(),
      persistWrites: canPersistWrites(),
      mediaUploadReady: useRemoteMediaUpload() || !process.env.VERCEL,
      lastPersistError: err.message || getLastPersistError(),
    });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  let store = await readFreshStore();
  const creds = getAdminCredentials();
  const emailNorm = String(email).toLowerCase();
  const wantsConfiguredLogin =
    emailNorm === creds.email.toLowerCase() && password === creds.password;

  let synced = await syncAdminCredentials(store);
  store = synced.store;

  let match =
    store.admin &&
    store.admin.email.toLowerCase() === emailNorm &&
    (await bcrypt.compare(password, store.admin.passwordHash));

  const defaultEmail = 'admin@gmail.com';
  const defaultPassword = 'Admin@123';
  const usesDocumentedDefaults =
    emailNorm === defaultEmail && password === defaultPassword;

  if (!match && usesDocumentedDefaults) {
    store.admin = {
      email: defaultEmail,
      passwordHash: await bcrypt.hash(defaultPassword, 10),
      name: store.admin?.name || 'Admin',
    };
    synced = { changed: true };
    match = true;
  }

  if (!match && wantsConfiguredLogin) {
    synced = await syncAdminCredentials(store);
    store = synced.store;
    match =
      store.admin &&
      store.admin.email.toLowerCase() === emailNorm &&
      (await bcrypt.compare(password, store.admin.passwordHash));
  }

  if (!match) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (synced.changed) {
    try {
      await updateStore((s) => {
        s.admin = store.admin;
        return s;
      });
    } catch (err) {
      console.error('[admin] credential sync failed:', err);
    }
  }

  const token = signAdminToken({
    email: store.admin.email,
    name: store.admin.name,
    role: 'admin',
  });
  return res.json({
    token,
    admin: { email: store.admin.email, name: store.admin.name },
  });
});

function parseOrderDate(dateStr) {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  try {
    const parts = dateStr.split(',');
    const dateParts = parts[0].trim().split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      
      if (parts[1]) {
        let timeStr = parts[1].trim();
        const ampmMatch = timeStr.match(/(am|pm)/i);
        const ampm = ampmMatch ? ampmMatch[0].toLowerCase() : '';
        timeStr = timeStr.replace(/(am|pm)/i, '').trim();
        const timeParts = timeStr.split(':');
        let hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1] || 0, 10);
        const seconds = parseInt(timeParts[2] || 0, 10);

        if (ampm === 'pm' && hours < 12) hours += 12;
        if (ampm === 'am' && hours === 12) hours = 0;
        
        return new Date(year, month, day, hours, minutes, seconds);
      }
      return new Date(year, month, day);
    }
  } catch (err) {
    console.error('Failed to parse date string:', dateStr, err);
  }
  return new Date();
}

router.get('/auth/me', requireAdmin, (req, res) => {
  res.json({
    admin: { email: req.admin.email, name: req.admin.name || 'Admin' },
  });
});

router.get('/analytics/overview', requireAdmin, async (req, res) => {
  let store = readStore();
  const confirmed = autoConfirmExpiredPendingOrders(store.orders);
  if (confirmed > 0) {
    store = await updateStore((s) => {
      autoConfirmExpiredPendingOrders(s.orders);
      return s;
    });
  }
  const activeOrders = store.orders.filter((o) => o.status !== 'Cancelled');
  const totalSales = activeOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const inventoryValue = store.products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock ?? 0),
    0
  );
  const outOfStock = store.products.filter((p) => (p.stock ?? 0) <= 0);
  const lowStock = store.products.filter((p) => {
    const s = p.stock ?? 0;
    return s > 0 && s < 8;
  });

  const categoryMix = store.products.reduce((acc, p) => {
    const key = p.subCategory || p.category || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const totalCategories = Object.keys(categoryMix).length;

  const recentOrders = [...store.orders]
    .sort((a, b) => {
      const dateA = parseOrderDate(a.createdAt || a.date);
      const dateB = parseOrderDate(b.createdAt || b.date);
      return dateB - dateA;
    })
    .slice(0, 5);

  const productQuantities = {};
  store.orders.forEach((o) => {
    if (o.status !== 'Cancelled') {
      (o.items || []).forEach((item) => {
        productQuantities[item.id] = (productQuantities[item.id] || 0) + (item.quantity || 1);
      });
    }
  });

  const topSelling = Object.entries(productQuantities)
    .map(([id, qty]) => {
      const p = store.products.find((prod) => prod.id === Number(id));
      return p
        ? {
            id: p.id,
            title: p.title,
            image: p.image,
            sales: qty,
            price: p.price,
            category: p.category,
          }
        : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);

  // Generate real daily sales data for the last 7 days
  const salesTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const daySales = store.orders
      .filter((o) => o.status !== 'Cancelled')
      .filter((o) => {
        const orderDate = parseOrderDate(o.createdAt || o.date);
        return orderDate >= dayStart && orderDate <= dayEnd;
      })
      .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    salesTrend.push({
      day: dayName,
      revenue: daySales,
    });
  }

  res.json({
    totalSales,
    totalOrders: store.orders.length,
    activeOrders: activeOrders.length,
    totalProducts: store.products.length,
    totalCategories,
    inventoryValue,
    outOfStock,
    lowStock,
    categoryMix,
    pendingOrders: store.orders.filter((o) => o.status === 'Pending').length,
    recentOrders,
    topSelling,
    salesTrend,
  });
});

router.post('/products/sync-catalog', requireAdmin, requireWritableStore, async (req, res) => {
  try {
    const result = await syncCatalogFromSource();
    res.json({ message: result.message || `Synced ${result.count} products`, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Catalog sync failed' });
  }
});

/** Lightweight row for admin inventory table (avoids huge JSON payloads). */
function slimProductForList(p) {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice,
    discount: p.discount,
    gender: p.gender,
    category: p.category,
    subCategory: p.subCategory,
    wearType: p.wearType,
    image: p.image,
    images: p.images?.length ? [p.images[0]] : [p.image],
    stock: p.stock,
    fabricTags: p.fabricTags,
    sizes: p.sizes,
    variants: p.variants,
    description:
      typeof p.description === 'string' ? p.description.slice(0, 280) : '',
  };
}

router.get('/products', requireAdmin, async (req, res) => {
  const store = await readFreshStore();
  let list = [...(store.products || [])].map(normalizeProductImages);
  const gender = req.query.gender;
  const category = req.query.category;
  const search = req.query.search?.toLowerCase();

  if (gender && gender !== 'all' && gender !== 'undefined') {
    list = list.filter((p) => p.gender === gender);
  }
  if (category && category !== 'all') {
    list = list.filter(
      (p) =>
        p.subCategory === category ||
        p.category === category ||
        (p.subCategory || '').includes(category)
    );
  }
  if (search) {
    list = list.filter((p) => p.title?.toLowerCase().includes(search));
  }

  res.json({
    products: list.map(slimProductForList),
    total: list.length,
  });
});

router.post('/products', requireAdmin, requireWritableStore, uploadProductImages, async (req, res) => {
  try {
    const body = req.body;
    const parsed = typeof body.data === 'string' ? JSON.parse(body.data) : body;

    const uploadedUrls = await saveUploadedProductImages(req.files || [], UPLOAD_DIR);

    const product = normalizeProductImages(buildProductFromPayload(parsed, uploadedUrls));
    const store = await readFreshStore();
    product.id = nextAdminProductId(store.products || []);
    product.source = 'admin';
    product.adminCreated = true;
    product.adminCreatedAt = new Date().toISOString();
    await saveSingleProduct(product);

    res.status(201).json({ message: 'Product Architecture Deployed Successfully.', product });
  } catch (err) {
    console.error('[products] create failed:', err);
    const status = err.message?.includes('not configured') ? 503 : 400;
    res.status(status).json({ error: err.message || 'Could not publish product. Try again.' });
  }
});

router.patch('/products/:id', requireAdmin, requireWritableStore, uploadProductImages, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const body = req.body;
    const parsed = typeof body.data === 'string' ? JSON.parse(body.data) : body;
    const uploadedUrls = await saveUploadedProductImages(req.files || [], UPLOAD_DIR);

    let updated = null;
    const store = await readFreshStore();
    const existing = store.products.find((p) => p.id === id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    updated = normalizeProductImages(buildProductFromPayload({ ...existing, ...parsed }, uploadedUrls, existing));
    updated.id = id;
    updated.source = existing.source || 'admin';
    updated.adminCreated = existing.adminCreated ?? true;
    updated.adminCreatedAt = existing.adminCreatedAt || new Date().toISOString();
    await saveSingleProduct(updated);

    res.json({ message: 'Product updated successfully.', product: updated });
  } catch (err) {
    console.error('[products] update failed:', err);
    const status = err.message?.includes('not configured') ? 503 : 400;
    res.status(status).json({ error: err.message || 'Could not update product. Try again.' });
  }
});

router.delete('/products/:id', requireAdmin, requireWritableStore, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const removed = await removeSingleProduct(id);
    if (!removed) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product removed from catalog' });
  } catch (err) {
    console.error('[products] delete failed:', err);
    const status = err.message?.includes('not configured') ? 503 : 500;
    res.status(status).json({ error: err.message || 'Could not delete product. Try again.' });
  }
});

router.get('/orders', requireAdmin, async (req, res) => {
  let orders = [];
  await updateStore((store) => {
    autoConfirmExpiredPendingOrders(store.orders);
    orders = store.orders;
    return store;
  });
  res.json({ orders });
});

router.patch('/orders/:orderId/status', requireAdmin, requireWritableStore, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body || {};
  const valid = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  let updated = null;
  await updateStore((store) => {
    store.orders = store.orders.map((o) => {
      if (o.id !== orderId) return o;
      const prev = o.status;
      updated = { ...o, status };
      if (
        (status === 'Processing' || status === 'Shipped') &&
        prev !== 'Processing' &&
        prev !== 'Shipped' &&
        prev !== 'Delivered'
      ) {
        deductStock(store.products, o.items);
      }
      return updated;
    });
    return store;
  });

  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json({ message: 'Order status updated', order: updated });
});

router.delete('/orders/:orderId', requireAdmin, requireWritableStore, async (req, res) => {
  const { orderId } = req.params;
  await updateStore((store) => {
    store.orders = store.orders.filter((o) => o.id !== orderId);
    return store;
  });
  res.json({ message: 'Order deleted' });
});

router.get('/coupons', requireAdmin, async (req, res) => {
  const store = readStore();
  res.json({ coupons: store.coupons });
});

router.post('/coupons', requireAdmin, requireWritableStore, async (req, res) => {
  const { code, discount, minPurchase, discountType } = req.body || {};
  if (!code || discount == null || discount === '' || !minPurchase) {
    return res.status(400).json({ error: 'All coupon fields required' });
  }
  const typeRaw = String(discountType || 'flat').toLowerCase();
  const discountTypeNorm =
    typeRaw === 'percent' || typeRaw === '%' || typeRaw === 'percentage' ? 'percent' : 'flat';
  const discountNum = Number(discount);
  if (discountTypeNorm === 'percent' && (discountNum < 1 || discountNum > 100)) {
    return res.status(400).json({ error: 'Percent discount must be between 1 and 100' });
  }
  if (discountTypeNorm === 'flat' && discountNum <= 0) {
    return res.status(400).json({ error: 'Flat discount must be greater than 0' });
  }
  const coupon = {
    code: String(code).toUpperCase(),
    discount: discountNum,
    discountType: discountTypeNorm,
    minPurchase: Number(minPurchase),
  };
  const store = readStore();
  if (store.coupons.some((c) => c.code === coupon.code)) {
    return res.status(400).json({ error: 'Coupon code already exists' });
  }
  await updateStore((s) => {
    s.coupons = [coupon, ...s.coupons];
    return s;
  });
  res.status(201).json({ message: 'Coupon activated', coupon });
});

router.delete('/coupons/:code', requireAdmin, requireWritableStore, async (req, res) => {
  const code = req.params.code.toUpperCase();
  if (code === 'SALE100') {
    return res.status(400).json({ error: 'SALE100 is a protected base coupon' });
  }
  await updateStore((store) => {
    store.coupons = store.coupons.filter((c) => c.code !== code);
    return store;
  });
  res.json({ message: 'Coupon removed' });
});

router.get('/settings', requireAdmin, async (req, res) => {
  const store = readStore();
  res.json({ settings: getStoreSettings(store) });
});

router.patch('/settings', requireAdmin, requireWritableStore, async (req, res) => {
  const body = req.body || {};
  const next = mergeSiteSettings(body);
  await updateStore((store) => {
    store.settings = next;
    return store;
  });
  res.json({ message: 'Settings saved', settings: next });
});

router.get('/ad-slots', requireAdmin, async (req, res) => {
  const adSlots = await resolveStoreAdSlots([]);
  res.json({ adSlots: getAdSlotsForAdmin({ adSlots }) });
});

function parseAdSlotsBody(body = {}) {
  if (body.payloadB64) {
    try {
      const json = Buffer.from(String(body.payloadB64), 'base64').toString('utf8');
      const parsed = JSON.parse(json);
      if (parsed?.slots && typeof parsed.slots === 'object' && !Array.isArray(parsed.slots)) {
        return parsed;
      }
    } catch {
      /* try direct body next */
    }
  }

  if (body?.slots && typeof body.slots === 'object' && !Array.isArray(body.slots)) {
    return body;
  }

  return body;
}

router.put('/ad-slots', requireAdmin, requireWritableStore, async (req, res) => {
  const parsed = parseAdSlotsBody(req.body || {});
  const { slots, slotsEncoded, clientFilledCount, merge: mergeMode, replaceAll } = parsed;
  if (!slots || typeof slots !== 'object' || Array.isArray(slots)) {
    return res.status(400).json({
      error: 'Could not read ad slots from request. Reload the page and save again.',
    });
  }
  const filledOnWire = Number(clientFilledCount) || Object.keys(slots).length;
  const next = buildAdSlotsFromPayload(slots, { wireEncoded: Boolean(slotsEncoded) });
  const useReplace = replaceAll !== false && !mergeMode;

  if (filledOnWire > 0 && next.length === 0) {
    return res.status(400).json({
      error:
        'Ad code was blocked while saving (hosting firewall). The app will retry slot-by-slot — click Save again.',
      saved: 0,
      clientFilledCount: filledOnWire,
    });
  }

  let merged;
  try {
    merged = useReplace ? await replaceAdSlots(next) : await mergeAdSlots(next);
  } catch (err) {
    console.error('[ad-slots] save failed:', err);
    return res.status(err.message?.includes('wipe') || err.message?.includes('remove') ? 400 : 503).json({
      error: err.message || 'Could not persist ad slots',
      saved: 0,
    });
  }

  res.json({
    message: 'Ad slots saved',
    saved: merged.length,
    activeAdSlots: merged.length,
    adSlots: getAdSlotsForAdmin({ adSlots: merged }),
  });
});

router.get('/gift-combos', requireAdmin, async (req, res) => {
  let list = getAdminGiftCombos(readStore());
  if (!list.length) {
    list = seedGiftCombosIfEmpty(readStore());
    await updateStore((s) => {
      s.giftCombos = list;
      return s;
    });
  }
  res.json({ giftCombos: list });
});

router.post('/gift-combos/seed-defaults', requireAdmin, requireWritableStore, async (req, res) => {
  const list = DEFAULT_GIFT_COMBOS.map((c, i) => buildGiftComboFromBody(c, null));
  await updateStore((s) => {
    s.giftCombos = list;
    return s;
  });
  res.json({ message: 'Default gift combos restored', giftCombos: list });
});

router.post('/gift-combos/upload', requireAdmin, requireWritableStore, uploadComboImages, async (req, res) => {
  try {
    const urls = await saveComboImages(req.files || [], COMBO_UPLOAD_DIR);
    res.json({ urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

router.post('/gift-combos', requireAdmin, requireWritableStore, async (req, res) => {
  const body = req.body || {};
  const combo = buildGiftComboFromBody({
    ...body,
    id: body.id || undefined,
    updatedAt: new Date().toISOString(),
  });
  const errors = validateGiftCombo(combo);
  if (errors.length) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  const list = getAdminGiftCombos(readStore());
  if (list.some((c) => c.id === combo.id)) {
    return res.status(409).json({ error: `Combo id "${combo.id}" already exists` });
  }

  await updateStore((s) => {
    if (!Array.isArray(s.giftCombos)) s.giftCombos = [];
    s.giftCombos = [...getAdminGiftCombos(s), combo];
    return s;
  });

  res.status(201).json({ message: 'Gift combo created', combo });
});

router.patch('/gift-combos/:id', requireAdmin, requireWritableStore, async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  let updated = null;

  await updateStore((s) => {
    const list = getAdminGiftCombos(s);
    const idx = list.findIndex((c) => c.id === id);
    if (idx < 0) return s;
    updated = buildGiftComboFromBody(
      { ...list[idx], ...body, id, updatedAt: new Date().toISOString() },
      list[idx],
    );
    const errors = validateGiftCombo(updated);
    if (errors.length) {
      updated = { __error: errors.join('; ') };
      return s;
    }
    const next = [...list];
    next[idx] = updated;
    s.giftCombos = next;
    return s;
  });

  if (!updated) {
    return res.status(404).json({ error: 'Combo not found' });
  }
  if (updated.__error) {
    return res.status(400).json({ error: updated.__error });
  }
  res.json({ message: 'Gift combo updated', combo: updated });
});

router.delete('/gift-combos/:id', requireAdmin, requireWritableStore, async (req, res) => {
  const { id } = req.params;
  let removed = false;
  await updateStore((s) => {
    const list = getAdminGiftCombos(s);
    const next = list.filter((c) => c.id !== id);
    removed = next.length < list.length;
    s.giftCombos = next;
    return s;
  });
  if (!removed) {
    return res.status(404).json({ error: 'Combo not found' });
  }
  res.json({ message: 'Gift combo removed' });
});

function buildProductFromPayload(data, newImages = [], existing = null) {
  const price = Number(data.price);
  const originalPrice = Number(data.originalPrice || data.price);
  const variants = data.variants || existing?.variants || [];
  const sizes = collectSizes(variants, data.sizes);
  const stock = computeTotalStock(variants, data.stock);
  const { image, images } = mergeUploadedProductImages(data, newImages, existing);

  const base = {
    id: data.id ?? existing?.id,
    source: existing?.source || 'admin',
    adminCreated: existing?.adminCreated ?? true,
    adminCreatedAt: existing?.adminCreatedAt || new Date().toISOString(),
    title: data.title,
    description: data.description || '',
    descriptionLong: data.descriptionLong || '',
    price,
    originalPrice,
    discount: data.discount || '',
    category: data.gender === 'gents' ? 'men' : 'women',
    gender: data.gender || 'ladies',
    subCategory: data.subCategory || data.category || 'kurtas',
    wearType: data.gender === 'gents' ? 'gents' : 'traditional',
    fabricTags: data.fabricTags || [],
    image,
    images: images.length ? images : [image],
    sizes,
    variants,
    stock,
    rating: data.rating ?? existing?.rating,
    reviewsCount: data.reviewsCount ?? existing?.reviewsCount,
    highlights: data.highlights ?? existing?.highlights,
    aboutItems: data.aboutItems ?? existing?.aboutItems,
    additionalInfo: data.additionalInfo ?? existing?.additionalInfo,
    sizeChart: data.sizeChart ?? existing?.sizeChart,
    sizeChartType: data.sizeChartType ?? existing?.sizeChartType,
  };

  return enrichProductRecord(base);
}

function collectSizes(variants, fallbackSizes) {
  const set = new Set(fallbackSizes || []);
  variants.forEach((v) => {
    Object.keys(v.stockBySize || {}).forEach((sz) => set.add(sz));
  });
  return set.size ? [...set] : ['S', 'M', 'L', 'XL'];
}

function computeTotalStock(variants, fallback) {
  if (!variants?.length) return Number(fallback) || 0;
  return variants.reduce((sum, v) => {
    const part = Object.values(v.stockBySize || {}).reduce((a, n) => a + Number(n || 0), 0);
    return sum + part;
  }, 0);
}

function deductStock(products, items) {
  items.forEach((item) => {
    const prod = products.find((p) => p.id === item.id);
    if (!prod) return;
    const qty = item.quantity || 1;
    const size = item.selectedSize;
    if (prod.variants?.length) {
      prod.variants.forEach((v) => {
        if (v.stockBySize?.[size] != null) {
          v.stockBySize[size] = Math.max(0, v.stockBySize[size] - qty);
        }
      });
      prod.stock = computeTotalStock(prod.variants);
    } else {
      prod.stock = Math.max(0, (prod.stock ?? 0) - qty);
    }
  });
}

export default router;
