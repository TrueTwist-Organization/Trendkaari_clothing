import { Router } from 'express';
import { readStore, readFreshStore, updateStore, resolveStoreAdSlots } from '../lib/store.js';
import { sendOrderConfirmationEmail } from '../lib/orderEmail.js';
import { optionalUser } from '../middleware/userAuth.js';
import { getStoreSettings, getActiveAdSlots } from '../lib/siteConfig.js';
import { getPublicGiftCombos } from '../lib/giftCombos.js';
import { normalizeProductImages } from '../lib/productImages.js';

const router = Router();

router.get('/products', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const store = await readFreshStore();
  const products = (store.products || []).map(normalizeProductImages);
  res.json({ products });
});

router.get('/coupons', (req, res) => {
  const store = readStore();
  res.json({ coupons: store.coupons });
});

router.get('/settings', (req, res) => {
  const store = readStore();
  res.json({ settings: getStoreSettings(store) });
});

router.get('/ad-slots', async (req, res) => {
  const placement = req.query.placement || null;
  const adSlots = await resolveStoreAdSlots([]);
  res.json({ adSlots: getActiveAdSlots({ adSlots }, placement || null) });
});

router.get('/gift-combos', (req, res) => {
  const store = readStore();
  res.json({ giftCombos: getPublicGiftCombos(store) });
});

router.post('/orders', optionalUser, async (req, res) => {
  const orderDetails = req.body;
  if (!orderDetails?.items?.length) {
    return res.status(400).json({ error: 'Order must include items' });
  }

  const store = readStore();
  const user = req.user ? (store.users || []).find((u) => u.id === req.user.id) : null;
  const guestEmail = String(orderDetails.email || '').trim();
  const guestPhone = String(orderDetails.phone || '').trim();

  const hasValidEmail = Boolean(guestEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail));
  const hasValidPhone = guestPhone.replace(/\D/g, '').length >= 10;
  if (!user && !hasValidEmail && !hasValidPhone) {
    return res.status(400).json({ error: 'Email or phone number is required to place your order' });
  }

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    userId: user?.id || null,
    customerName: orderDetails.name || user?.name,
    email: guestEmail || user?.email || '',
    phone: guestPhone || user?.phone,
    address: orderDetails.address,
    items: orderDetails.items,
    subtotal: orderDetails.subtotal,
    discount: orderDetails.discount || 0,
    grandTotal: orderDetails.grandTotal,
    status: 'Pending',
    paymentStatus: 'Paid',
    date: new Date().toLocaleString('en-IN', { hour12: true }),
    createdAt: new Date().toISOString(),
  };

  await updateStore((store) => {
    orderDetails.items.forEach((item) => {
      const prod = store.products.find((p) => p.id === item.id);
      if (!prod) return;
      const qty = item.quantity || 1;
      const size = item.selectedSize;
      if (prod.variants?.length) {
        prod.variants.forEach((v) => {
          if (v.stockBySize?.[size] != null) {
            v.stockBySize[size] = Math.max(0, v.stockBySize[size] - qty);
          }
        });
        prod.stock = prod.variants.reduce(
          (sum, v) =>
            sum + Object.values(v.stockBySize || {}).reduce((a, n) => a + Number(n || 0), 0),
          0
        );
      } else {
        prod.stock = Math.max(0, (prod.stock ?? 15) - qty);
      }
    });
    store.orders = [newOrder, ...store.orders];
    return store;
  });

  const emailResult = await sendOrderConfirmationEmail(
    newOrder,
    orderDetails.email || user?.email
  );

  res.status(201).json({
    message: emailResult.sent
      ? 'Order placed successfully'
      : 'Order saved but confirmation email could not be sent',
    order: newOrder,
    emailSent: emailResult.sent,
  });
});

export default router;
