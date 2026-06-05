import bcrypt from 'bcryptjs';
import { initStore, readStore, readFreshStore, writeStore } from './store.js';
import { normalizeProduct } from './catalog.js';

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123',
  };
}

/** Keep admin login aligned with ADMIN_EMAIL / ADMIN_PASSWORD (or defaults). */
export async function syncAdminCredentials(store) {
  const { email: adminEmail, password: adminPassword } = getAdminCredentials();
  let changed = false;

  if (!store.admin) {
    store.admin = {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: 'Admin',
    };
    return { store, changed: true };
  }

  const passwordMatches = store.admin.passwordHash
    ? await bcrypt.compare(adminPassword, store.admin.passwordHash)
    : false;

  if (store.admin.email !== adminEmail || !passwordMatches) {
    store.admin.email = adminEmail;
    store.admin.passwordHash = await bcrypt.hash(adminPassword, 10);
    store.admin.name = store.admin.name || 'Admin';
    changed = true;
  }

  return { store, changed };
}

export async function ensureSeeded() {
  await initStore();
  const store = await readFreshStore();
  let changed = false;

  const adminSync = await syncAdminCredentials(store);
  Object.assign(store, adminSync.store);
  if (adminSync.changed) changed = true;

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
