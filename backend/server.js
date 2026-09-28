const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'nevra.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK(price >= 0),
  images_json TEXT NOT NULL DEFAULT '[]',
  sizes_json TEXT NOT NULL DEFAULT '[]',
  availability INTEGER NOT NULL DEFAULT 1,
  color TEXT
);
CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
  PRIMARY KEY(product_id, size),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  currency TEXT NOT NULL DEFAULT 'UAH',
  subtotal INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
);
`);

const seed = [
  ['NEVRA-HOODIE-001','NEVRA Essential Hoodie',2900,['assets/hoodie-1.jpg','assets/hoodie-2.jpg','assets/hoodie-3.jpg','assets/hoodie-4.jpg','assets/hoodie-6.jpg','assets/hoodie-7.jpg'],['S','M','L','XL','XXL'],1,null],
  ['NEVRA-TRACKSUIT-001','NEVRA Tracksuit',5900,['assets/suit-3.png','assets/suit-4.png','assets/suit-5.png','assets/suit-6.png','assets/suit-7.png','assets/suit-8.png','assets/suit-9.png'],['S','M','L','XL','XXL'],1,null],
  ['NEVRA-TSHIRT-BLK-001','Black T-shirt',1200,['assets/shirt-black.jpg'],['S','M','L','XL','XXL'],1,'Black'],
  ['NEVRA-TSHIRT-WHT-001','White T-shirt',1200,['assets/shirt-black.jpg'],['S','M','L','XL','XXL'],1,'White'],
  ['NEVRA-TSHIRT-GRY-001','Grey T-shirt',1200,['assets/shirt-black.jpg'],['S','M','L','XL','XXL'],1,'Grey'],
  ['NEVRA-TSHIRT-KHK-001','Khaki T-shirt',1200,['assets/shirt-khaki.jpg'],['S','M','L','XL','XXL'],1,'Khaki']
];
const productCount = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
if (Number(productCount) === 0) {
  const addProduct = db.prepare(`INSERT INTO products(id,name,price,images_json,sizes_json,availability,color) VALUES(?,?,?,?,?,?,?)`);
  const addStock = db.prepare(`INSERT INTO inventory(product_id,size,quantity) VALUES(?,?,?)`);
  for (const p of seed) {
    addProduct.run(p[0],p[1],p[2],JSON.stringify(p[3]),JSON.stringify(p[4]),p[5],p[6]);
    for (const size of p[4]) addStock.run(p[0], size, 10);
  }
}

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(payload);
}
function parseBody(req) {
  return new Promise((resolve,reject)=>{
    let raw='';
    req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) req.destroy(); });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}
function productRow(row) {
  if (!row) return null;
  const stock = db.prepare('SELECT size, quantity FROM inventory WHERE product_id=? ORDER BY size').all(row.id);
  return {...row, images: JSON.parse(row.images_json), sizes: JSON.parse(row.sizes_json),
    availability: Boolean(row.availability), inventory: Object.fromEntries(stock.map(s=>[s.size,s.quantity]))};
}
function validItems(items) {
  if (!Array.isArray(items) || !items.length) throw new Error('Order must contain at least one item');
  return items.map(item => {
    const id = String(item.productId || '');
    const size = item.size ? String(item.size) : null;
    const quantity = Number(item.quantity);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Invalid order item');
    const product = productRow(db.prepare('SELECT * FROM products WHERE id=?').get(id));
    if (!product || !product.availability) throw new Error(`Product unavailable: ${id}`);
    if (size && !product.sizes.includes(size)) throw new Error(`Invalid size for ${id}`);
    const available = size ? Number(product.inventory[size] || 0) : 0;
    if (!size || available < quantity) throw new Error(`Insufficient stock for ${id}${size ? ` / ${size}` : ''}`);
    return {product, size, quantity};
  });
}

async function handler(req,res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res,200,{ok:true,service:'NEVRA API'});
    if (req.method === 'GET' && url.pathname === '/api/products') {
      const rows = db.prepare('SELECT * FROM products ORDER BY name').all();
      return send(res,200,{products:rows.map(productRow)});
    }
    const pm = url.pathname.match(/^\/api\/products\/([^/]+)$/);
    if (req.method === 'GET' && pm) {
      const row = db.prepare('SELECT * FROM products WHERE id=?').get(decodeURIComponent(pm[1]));
      return row ? send(res,200,{product:productRow(row)}) : send(res,404,{error:'Product not found'});
    }
    if (req.method === 'GET' && url.pathname === '/api/inventory') {
      const rows = db.prepare(`SELECT p.id, p.name, i.size, i.quantity FROM products p JOIN inventory i ON i.product_id=p.id ORDER BY p.name,i.size`).all();
      return send(res,200,{inventory:rows});
    }
    if (req.method === 'POST' && url.pathname === '/api/orders') {
      const body = await parseBody(req);
      const customer = body.customer || {};
      const items = validItems(body.items);
      const subtotal = items.reduce((s,i)=>s+i.product.price*i.quantity,0);
      const orderId = `NEVRA-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

      db.exec('BEGIN IMMEDIATE');
      try {
        const c = db.prepare(`INSERT INTO customers(email,first_name,last_name,phone,address,city,postal_code,country) VALUES(?,?,?,?,?,?,?,?)`)
          .run(customer.email || null, customer.firstName || null, customer.lastName || null, customer.phone || null,
               customer.address || null, customer.city || null, customer.postalCode || null, customer.country || null);
        const customerId = Number(c.lastInsertRowid);
        db.prepare(`INSERT INTO orders(id,customer_id,status,payment_status,subtotal,total) VALUES(?,?,?,?,?,?)`)
          .run(orderId, customerId, 'pending', 'unpaid', subtotal, subtotal);
        const addItem = db.prepare(`INSERT INTO order_items(order_id,product_id,size,quantity,unit_price) VALUES(?,?,?,?,?)`);
        const reduce = db.prepare(`UPDATE inventory SET quantity=quantity-? WHERE product_id=? AND size=? AND quantity>=?`);
        for (const item of items) {
          addItem.run(orderId,item.product.id,item.size,item.quantity,item.product.price);
          const result = reduce.run(item.quantity,item.product.id,item.size,item.quantity);
          if (Number(result.changes) !== 1) throw new Error(`Stock changed: ${item.product.id}`);
        }
        db.exec('COMMIT');
      } catch(e) { db.exec('ROLLBACK'); throw e; }

      return send(res,201,{order:{id:orderId,status:'pending',paymentStatus:'unpaid',currency:'UAH',subtotal,total:subtotal}});
    }
    return send(res,404,{error:'Not found'});
  } catch (e) {
    return send(res,400,{error:e.message || 'Request failed'});
  }
}

http.createServer(handler).listen(PORT,HOST,()=>console.log(`NEVRA API listening on http://${HOST}:${PORT}`));
