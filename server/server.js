require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Pool } = require('pg');
const provider = require('./services/smmvault');
const { syncOrders } = require('./jobs/orderSync');
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = process.env.PORT || 5000;
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const timestamp = req.headers['x-webhook-timestamp'];
    const signature = req.headers['x-webhook-signature'];
    const rawBody = req.body.toString('utf8');
    const expected = crypto
      .createHmac('sha256', process.env.CASHFREE_CLIENT_SECRET || '')
      .update(`${timestamp}${rawBody}`)
      .digest('base64');
    if (!timestamp || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
      return res.status(401).json({ error: 'Invalid webhook signature' });

    const event = JSON.parse(rawBody);
    const orderId = event.data?.order?.order_id;
    const paymentId = event.data?.payment?.cf_payment_id;
    const paymentStatus = event.data?.payment?.payment_status;
    if (event.type !== 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus !== 'SUCCESS' || !orderId || !paymentId)
      return res.json({ received: true });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const payment = (await client.query(
        'SELECT * FROM payments WHERE provider_payment_id=$1 OR reference=$2 FOR UPDATE',
        [String(paymentId), String(orderId)]
      )).rows[0];
      if (!payment || payment.status === 'paid') {
        await client.query('COMMIT');
        return res.json({ received: true });
      }
      const amount = Number(payment.amount);
      const wallet = (await client.query('SELECT * FROM wallets WHERE user_id=$1 FOR UPDATE', [payment.user_id])).rows[0];
      const balance = Number(wallet.balance) + amount;
      await client.query(
        "UPDATE wallets SET balance=$1,total_deposited=total_deposited+$2,updated_at=now() WHERE user_id=$3",
        [balance, amount, payment.user_id]
      );
      await client.query(
        "INSERT INTO wallet_transactions(user_id,type,amount,balance_after,reference,note) VALUES($1,'Deposit',$2,$3,$4,'Cashfree payment')",
        [payment.user_id, amount, balance, String(orderId)]
      );
      await client.query('UPDATE payments SET status=\'paid\',provider_payment_id=$1 WHERE id=$2', [String(paymentId), payment.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    res.json({ received: true });
  } catch (error) {
    console.error(`Cashfree webhook failed: ${error.message}`);
    res.status(400).json({ error: 'Invalid Cashfree webhook' });
  }
});
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
const cleanPages = {
  '/': 'index.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/services': 'services.html',
  '/new-order': 'new-order.html',
  '/orders': 'orders.html',
  '/order-details': 'order-details.html',
  '/add-funds': 'add-funds.html',
  '/transactions': 'transactions.html',
  '/profile': 'profile.html',
  '/support': 'support.html',
  '/admin': 'admin/index.html',
};
Object.entries(cleanPages).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(__dirname, '..', 'public', file)));
});
Object.keys(cleanPages).forEach((route) => {
  if (route !== '/') app.get(`${route}.html`, (req, res) => res.redirect(301, route));
});
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.use(express.static(path.join(__dirname, '..', 'public')));
const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
}
function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}
const fail = (res, e) => {
  console.error(e.message);
  res.status(e.status || 400).json({ error: e.publicMessage || e.message || 'Request failed' });
};
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !password || password.length < 8)
      return res
        .status(400)
        .json({ error: 'Use a valid email and password of at least 8 characters' });
    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role,status',
      [name, email.toLowerCase(), hash]
    );
    await pool.query('INSERT INTO wallets(user_id) VALUES($1)', [result.rows[0].id]);
    res.status(201).json({ user: result.rows[0], token: sign(result.rows[0]) });
  } catch (e) {
    fail(
      res,
      e.code === '23505' ? Object.assign(new Error('Email already registered'), { status: 409 }) : e
    );
  }
});
app.post('/api/auth/login', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [
      String(req.body.email || '').toLowerCase(),
    ]);
    const user = result.rows[0];
    if (
      !user ||
      !(await bcrypt.compare(req.body.password || '', user.password_hash)) ||
      user.status !== 'active'
    )
      return res.status(401).json({ error: 'Invalid email or password' });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: sign(user),
    });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id,name,email,role,status,created_at FROM users WHERE id=$1',
      [req.user.id]
    );
    res.json({ user: r.rows[0] });
  } catch (e) {
    fail(res, e);
  }
});
app.post('/api/auth/logout', (req, res) => res.json({ success: true }));
app.get('/api/services', async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM services WHERE status='active' ORDER BY featured DESC, category, name"
    );
    res.json({ services: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/services/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM services WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Service not found' });
    res.json({ service: r.rows[0] });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/wallet', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM wallets WHERE user_id=$1', [req.user.id]);
    res.json({ wallet: r.rows[0] || { balance: 0, total_deposited: 0, total_spent: 0 } });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/wallet/transactions', auth, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM wallet_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    );
    res.json({ transactions: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/orders', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [
      req.user.id,
    ]);
    res.json({ orders: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/orders/:id', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [
      req.params.id,
      req.user.id,
    ]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: r.rows[0] });
  } catch (e) {
    fail(res, e);
  }
});
app.post('/api/orders', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { service_id, link, quantity } = req.body;
    const q = Number(quantity);
    await client.query('BEGIN');
    const sr = await client.query(
      "SELECT * FROM services WHERE id=$1 AND status='active' FOR SHARE",
      [service_id]
    );
    const s = sr.rows[0];
    if (!s)
      throw Object.assign(new Error('Service is currently unavailable'), {
        publicMessage: 'Service is currently unavailable',
      });
    if (!Number.isInteger(q) || q < s.min_quantity || q > s.max_quantity)
      throw Object.assign(new Error('Invalid quantity'), {
        publicMessage: `Quantity must be between ${s.min_quantity} and ${s.max_quantity}`,
      });
    const customer = Number(((q * Number(s.selling_rate)) / 1000).toFixed(2));
    const cost = Number(((q * Number(s.provider_rate)) / 1000).toFixed(2));
    const wallet = (
      await client.query('SELECT * FROM wallets WHERE user_id=$1 FOR UPDATE', [req.user.id])
    ).rows[0];
    if (!wallet || Number(wallet.balance) < customer)
      throw Object.assign(new Error('Insufficient wallet balance'), {
        publicMessage: 'Insufficient wallet balance',
      });
    const placed = await provider.createOrder({
      service: s.provider_service_id,
      link,
      quantity: q,
    });
    const providerId = placed.order;
    if (!providerId) throw new Error('Provider did not return an order ID');
    const order = (
      await client.query(
        'INSERT INTO orders(user_id,service_id,provider_order_id,service_name_snapshot,category_snapshot,link,quantity,provider_rate,selling_rate,provider_cost,customer_price,profit,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',
        [
          req.user.id,
          s.id,
          String(providerId),
          s.name,
          s.category,
          link,
          q,
          s.provider_rate,
          s.selling_rate,
          cost,
          customer,
          customer - cost,
          'Pending',
        ]
      )
    ).rows[0];
    const balance = Number(wallet.balance) - customer;
    await client.query(
      'UPDATE wallets SET balance=$1,total_spent=total_spent+$2,updated_at=now() WHERE user_id=$3',
      [balance, customer, req.user.id]
    );
    await client.query(
      'INSERT INTO wallet_transactions(user_id,type,amount,balance_after,reference,note) VALUES($1,$2,$3,$4,$5,$6)',
      [req.user.id, 'Order Payment', -customer, balance, String(order.id), s.name]
    );
    await client.query('COMMIT');
    res.status(201).json({ order });
  } catch (e) {
    await client.query('ROLLBACK');
    fail(res, e);
  } finally {
    client.release();
  }
});
app.post('/api/payments/create', auth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const phone = String(req.body.phone || '').replace(/\D/g, '');
    if (!Number.isInteger(amount) || amount < 10 || amount > 100000)
      return res.status(400).json({ error: 'Amount must be between ₹10 and ₹100,000' });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid 10-digit phone number' });
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET)
      return res.status(503).json({ error: 'Cashfree payment is not configured yet' });

    const orderId = `smm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const apiUrl = process.env.CASHFREE_ENV === 'production'
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';
    const { data } = await require('axios').post(apiUrl, {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: { customer_id: String(req.user.id), customer_name: req.user.email, customer_email: req.user.email, customer_phone: phone },
      order_meta: { return_url: `${process.env.APP_URL || 'http://localhost:5000'}/index.html?payment=success` },
    }, {
      headers: { 'x-client-id': process.env.CASHFREE_CLIENT_ID, 'x-client-secret': process.env.CASHFREE_CLIENT_SECRET, 'x-api-version': '2023-08-01', 'Content-Type': 'application/json' },
    });
    await pool.query(
      "INSERT INTO payments(user_id,provider,provider_payment_id,amount,status,reference) VALUES($1,'cashfree',$2,$3,'created',$4)",
      [req.user.id, data.payment_session_id, amount, orderId]
    );
    res.json({ payment_session_id: data.payment_session_id, mode: process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox' });
  } catch (error) {
    fail(res, Object.assign(new Error(error.response?.data?.message || 'Cashfree order creation failed'), { status: 502 }));
  }
});
app.get('/api/payments/history', auth, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payments WHERE user_id=$1 ORDER BY created_at DESC', [
      req.user.id,
    ]);
    res.json({ payments: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/admin/stats', auth, admin, async (req, res) => {
  try {
    const [u, o, w] = await Promise.all([
      pool.query(
        'SELECT COUNT(*)::int AS total, COUNT(*) FILTER(WHERE created_at::date=CURRENT_DATE)::int AS today FROM users'
      ),
      pool.query(
        'SELECT COUNT(*)::int AS total, COUNT(*) FILTER(WHERE created_at::date=CURRENT_DATE)::int AS today, COALESCE(SUM(customer_price),0) revenue, COALESCE(SUM(provider_cost),0) cost, COALESCE(SUM(profit),0) profit FROM orders'
      ),
      pool.query('SELECT COALESCE(SUM(total_deposited),0) deposits FROM wallets'),
    ]);
    res.json({ users: u.rows[0], orders: o.rows[0], deposits: w.rows[0].deposits });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/admin/users', auth, admin, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/admin/orders', auth, admin, async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT o.*,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC'
    );
    res.json({ orders: r.rows });
  } catch (e) {
    fail(res, e);
  }
});
app.get('/api/admin/services', auth, admin, async (req, res) => {
  const r = await pool.query('SELECT * FROM services ORDER BY category,name');
  res.json({ services: r.rows });
});
app.post('/api/admin/services/sync', auth, admin, async (req, res) => {
  try {
    const incoming = await provider.getServices();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const seen = [];
      for (const s of incoming) {
        seen.push(String(s.service));
        await client.query(
          `INSERT INTO services(provider_service_id,category,name,description,type,provider_rate,selling_rate,min_quantity,max_quantity,refill_available,cancel_available) VALUES($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10) ON CONFLICT(provider_service_id) DO UPDATE SET category=EXCLUDED.category,name=EXCLUDED.name,description=EXCLUDED.description,type=EXCLUDED.type,provider_rate=EXCLUDED.provider_rate,min_quantity=EXCLUDED.min_quantity,max_quantity=EXCLUDED.max_quantity,refill_available=EXCLUDED.refill_available,cancel_available=EXCLUDED.cancel_available,status='active',updated_at=now()`,
          [
            String(s.service),
            s.category,
            s.name,
            s.description || '',
            s.type || 'default',
            Number(s.rate) || 0,
            Number(s.min) || 1,
            Number(s.max) || 100000,
            Boolean(s.refill),
            Boolean(s.cancel),
          ]
        );
      }
      if (seen.length)
        await client.query(
          "UPDATE services SET status='inactive',updated_at=now() WHERE provider_service_id <> ALL($1::text[])",
          [seen]
        );
      await client.query('COMMIT');
      res.json({ success: true, count: seen.length });
    } finally {
      client.release();
    }
  } catch (e) {
    fail(res, e);
  }
});
app.patch('/api/admin/services/:id', auth, admin, async (req, res) => {
  try {
    const allowed = [
      'name',
      'description',
      'category',
      'selling_rate',
      'min_quantity',
      'max_quantity',
      'status',
      'featured',
    ];
    const fields = Object.keys(req.body).filter((k) => allowed.includes(k));
    if (!fields.length) return res.status(400).json({ error: 'No editable fields supplied' });
    const vals = fields.map((k) => req.body[k]);
    const set = fields.map((k, i) => `${k}=$${i + 1}`).join(',');
    const r = await pool.query(
      `UPDATE services SET ${set},updated_at=now() WHERE id=$${fields.length + 1} RETURNING *`,
      [...vals, req.params.id]
    );
    res.json({ service: r.rows[0] });
  } catch (e) {
    fail(res, e);
  }
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
  console.log(`SMM panel listening on http://localhost:${port}`);
  syncOrders(pool).catch((error) => console.error(`Initial order sync failed: ${error.message}`));
  setInterval(
    () => syncOrders(pool).catch((error) => console.error(`Order sync failed: ${error.message}`)),
    5 * 60 * 1000
  );
});
