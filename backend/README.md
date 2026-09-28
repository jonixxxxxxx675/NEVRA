# NEVRA Backend — V1

Technical backend layer for Products, Inventory, Customers, Orders and Order Items.

## Run

```bash
cd backend
npm start
```

API:
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/inventory`
- `POST /api/orders`

SQLite database is created automatically at `backend/data/nevra.sqlite`.

The existing frontend is intentionally not changed in V1. Payment processing is not implemented yet; orders are created with `payment_status = unpaid` until a real payment provider is connected.
