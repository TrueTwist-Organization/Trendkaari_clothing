import bcrypt from 'bcryptjs';
import { initStore, readStore, writeStore } from './store.js';
import { normalizeProduct } from './catalog.js';

export async function ensureSeeded() {
  await initStore();
  const store = readStore();
  let changed = false;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  if (!store.admin) {
    store.admin = {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: 'Admin',
    };
    changed = true;
  } else if (store.admin.email !== adminEmail) {
    store.admin.email = adminEmail;
    store.admin.passwordHash = await bcrypt.hash(adminPassword, 10);
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
    await writeStore(store);
  }

  return store;
}
