# FlexFit Admin Panel

Admin panel spec from `Admin Panel.pdf` — dark cyber UI, JWT auth, REST APIs, JSON database.

## Quick start

```bash
npm install
npm run dev:all
```

- Storefront: http://localhost:5173
- Admin panel: http://localhost:5173/admin
- API: http://localhost:3001/api/health

## Login credentials

| Field | Value |
|-------|--------|
| **Email** | `admin@gmail.com` |
| **Password** | `Admin@123` |

Change via `.env`:

```
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourSecurePassword
JWT_SECRET=your-long-secret
```

Restart the server after changing `.env`.

## API endpoints

### Auth
- `POST /api/admin/auth/login` — `{ email, password }` → `{ token, admin }`
- `GET /api/admin/auth/me` — Bearer token required

### Dashboard
- `GET /api/admin/analytics/overview` — sales, orders, stock alerts

### Products
- `GET /api/admin/products?gender=ladies|gents`
- `POST /api/admin/products` — multipart: `data` (JSON) + `images` (files)
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

### Orders
- `GET /api/admin/orders`
- `PATCH /api/admin/orders/:orderId/status` — `{ status }`
- `DELETE /api/admin/orders/:orderId`

### Coupons
- `GET /api/admin/coupons`
- `POST /api/admin/coupons` — `{ code, discount, minPurchase }`
- `DELETE /api/admin/coupons/:code`

### Gift combos (homepage Gift Collection)
- `GET /api/admin/gift-combos`
- `POST /api/admin/gift-combos` — JSON body (name, price, images, product IDs, etc.)
- `PATCH /api/admin/gift-combos/:id`
- `DELETE /api/admin/gift-combos/:id`
- `POST /api/admin/gift-combos/upload` — multipart `images` → saves to `public/combos/`
- `POST /api/admin/gift-combos/seed-defaults` — restore built-in combo set

Admin UI: **Gift Combos** in the sidebar (`/admin`).

### Store (public)
- `GET /api/store/products`
- `GET /api/store/coupons`
- `GET /api/store/gift-combos`
- `POST /api/store/orders` — checkout

## Features

- 4-step product wizard (Basic → Taxonomy → Variants → Media)
- Gender-based categories (Ladies / Gents)
- Size stock grid per color variant
- Order status updates with stock deduction on Processing/Shipped
- Uploads saved to `public/product-media/`
- Data persisted in `server/data/store.json`
