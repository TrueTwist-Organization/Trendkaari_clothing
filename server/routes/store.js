import { Router } from 'express';
import { readStore, updateStore } from '../lib/store.js';
import { requireUser } from '../middleware/userAuth.js';
import { getStoreSettings, getActiveAdSlots } from '../lib/siteConfig.js';

const router = Router();

router.get('/products', (req, res) => {
  const store = readStore();
  res.json({ products: store.products });
});

router.get('/coupons', (req, res) => {
  const store = readStore();
  res.json({ coupons: store.coupons });
});

router.get('/settings', (req, res) => {
  const store = readStore();
  res.json({ settings: getStoreSettings(store) });
});

router.get('/ad-slots', (req, res) => {
  const store = readStore();
  const placement = req.query.placement || null;
  res.json({ adSlots: getActiveAdSlots(store, placement || null) });
});

router.post('/orders', requireUser, async (req, res) => {
  const orderDetails = req.body;
  if (!orderDetails?.items?.length) {
    return res.status(400).json({ error: 'Order must include items' });
  }

  const store = readStore();
  const user = (store.users || []).find((u) => u.id === req.user.id);

  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    userId: req.user.id,
    customerName: orderDetails.name || user?.name,
    email: user?.email || '',
    phone: orderDetails.phone || user?.phone,
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

  updateStore((store) => {
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

  res.status(201).json({
    message: 'Order placed successfully',
    order: newOrder,
  });
});

export default router;
