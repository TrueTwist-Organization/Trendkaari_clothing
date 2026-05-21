import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { readStore, updateStore } from '../lib/store.js';
import { requireUser, signUserToken } from '../middleware/userAuth.js';
import {
  CANCEL_WINDOW_MS,
  autoConfirmExpiredPendingOrders,
  parseOrderPlacedAt,
} from '../lib/orderAutoConfirm.js';

const router = Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
  };
}

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body || {};
  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const store = readStore();
  if ((store.users || []).some((u) => u.email === emailNorm)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const user = {
    id: `USR-${Date.now()}`,
    name: String(name).trim(),
    email: emailNorm,
    phone: String(phone || '').trim(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };

  await updateStore((s) => {
    s.users = s.users || [];
    s.users.push(user);
    return s;
  });

  const token = signUserToken({ id: user.id, email: user.email, role: 'user' });
  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: sanitizeUser(user),
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailNorm = String(email).trim().toLowerCase();
  const store = readStore();
  const user = (store.users || []).find((u) => u.email === emailNorm);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signUserToken({ id: user.id, email: user.email, role: 'user' });
  res.json({ token, user: sanitizeUser(user) });
});

router.get('/me', requireUser, (req, res) => {
  const store = readStore();
  const user = (store.users || []).find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: sanitizeUser(user) });
});

router.get('/orders', requireUser, async (req, res) => {
  let orders = [];
  await updateStore((store) => {
    autoConfirmExpiredPendingOrders(store.orders);
    orders = (store.orders || []).filter((o) => o.userId === req.user.id);
    return store;
  });
  res.json({ orders });
});

function restoreOrderStock(store, items) {
  (items || []).forEach((item) => {
    const prod = store.products.find((p) => p.id === item.id);
    if (!prod) return;
    const qty = item.quantity || 1;
    const size = item.selectedSize;
    if (prod.variants?.length) {
      prod.variants.forEach((v) => {
        if (v.stockBySize?.[size] != null) {
          v.stockBySize[size] = Number(v.stockBySize[size] || 0) + qty;
        }
      });
      prod.stock = prod.variants.reduce(
        (sum, v) =>
          sum + Object.values(v.stockBySize || {}).reduce((a, n) => a + Number(n || 0), 0),
        0
      );
    } else {
      prod.stock = Number(prod.stock ?? 0) + qty;
    }
  });
}

router.patch('/orders/:orderId/cancel', requireUser, async (req, res) => {
  const { orderId } = req.params;
  let updated = null;
  let error = null;

  await updateStore((store) => {
    const idx = (store.orders || []).findIndex(
      (o) => o.id === orderId && o.userId === req.user.id
    );
    if (idx === -1) {
      error = { status: 404, message: 'Order not found' };
      return store;
    }

    autoConfirmExpiredPendingOrders(store.orders);
    const order = store.orders[idx];

    if (order.status === 'Cancelled') {
      error = { status: 400, message: 'Order is already cancelled' };
      return store;
    }
    if (order.status !== 'Pending') {
      error = {
        status: 400,
        message: 'This order is confirmed and can no longer be cancelled',
      };
      return store;
    }

    const placedAt = parseOrderPlacedAt(order);
    if (!placedAt || Date.now() - placedAt.getTime() > CANCEL_WINDOW_MS) {
      error = {
        status: 400,
        message: 'Cancellation is only available within 24 hours of placing the order',
      };
      return store;
    }

    restoreOrderStock(store, order.items);
    updated = {
      ...order,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
    };
    store.orders[idx] = updated;
    return store;
  });

  if (error) {
    return res.status(error.status).json({ error: error.message });
  }
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ message: 'Order cancelled successfully', order: updated });
});

router.patch('/profile', requireUser, async (req, res) => {
  const { name, phone } = req.body || {};
  let updated = null;

  await updateStore((s) => {
    s.users = (s.users || []).map((u) => {
      if (u.id !== req.user.id) return u;
      updated = {
        ...u,
        name: name?.trim() ? name.trim() : u.name,
        phone: phone != null ? String(phone).trim() : u.phone,
      };
      return updated;
    });
    return s;
  });

  if (!updated) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(updated) });
});

export default router;
