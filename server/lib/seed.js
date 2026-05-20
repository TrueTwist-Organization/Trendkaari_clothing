import bcrypt from 'bcryptjs';
import { readStore, writeStore } from './store.js';
import { normalizeProduct } from './catalog.js';

export async function ensureSeeded() {
  const store = readStore();
  let changed = false;

  if (!store.admin) {
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const email = process.env.ADMIN_EMAIL || 'admin@flexfitstudio.com';
    store.admin = {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name: 'FlexFit Admin',
    };
    changed = true;
  }

  if (!store.products?.length) {
    try {
      const { products } = await import('../../src/data/products.js');
      store.products = products.map(normalizeProduct);
      changed = true;
      console.log(`[seed] Loaded ${store.products.length} products from catalog`);
    } catch (err) {
      console.warn('[seed] Could not import products:', err.message);
    }
  }

  if (!store.users) {
    store.users = [];
    changed = true;
  }

  if (!store.orders?.length) {
    store.orders = [
      {
        id: 'ORD-894103',
        customerName: 'Aishwarya Sen',
        email: 'aishwarya@yahoo.com',
        phone: '+91 98845 22912',
        address: 'Apt 2B, Gulmohar Court, Sector 15, Vashi, Navi Mumbai, 400703',
        items: [
          {
            id: 241,
            title: 'Classic Ivory Cotton Dupatta Set',
            price: 2106,
            selectedSize: 'M',
            quantity: 1,
            image: '/dupatta-sets/1/lbl101ks854_1_700x.webp',
          },
        ],
        subtotal: 2106,
        discount: 100,
        grandTotal: 2006,
        status: 'Delivered',
        paymentStatus: 'Paid',
        date: '17/05/2026, 04:32 PM',
      },
    ];
    changed = true;
  }

  if (changed) {
    writeStore(store);
  }

  return store;
}
