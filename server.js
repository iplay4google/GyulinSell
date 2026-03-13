require('dotenv').config();
const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const USERS_FILE = './users.json';
const ORDERS_FILE = './orders.json';
const PRODUCTS_FILE = './products.json';

// ---------------- USER REGISTRATION ----------------
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });

  let users = [];
  if (fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE));

  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, email, password: hashed });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: 'Account created' });
});

// ---------------- USER LOGIN ----------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!fs.existsSync(USERS_FILE)) return res.status(400).json({ error: 'No users registered' });
  const users = JSON.parse(fs.readFileSync(USERS_FILE));

  // Owner account check
  if (email === 'Owner3123') {
    if (password === 'fTbo2bfIp3ThvyGC') {
      return res.json({ message: 'Owner login', role: 'owner' });
    } else return res.status(400).json({ error: 'Incorrect password' });
  }

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Incorrect password' });

  res.json({ message: 'Login successful', username: user.username, email: user.email, role: 'user' });
});

// ---------------- GET PRODUCTS ----------------
app.get('/products', (req, res) => {
  if (!fs.existsSync(PRODUCTS_FILE)) return res.json([]);
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  res.json(products);
});

// ---------------- STRIPE CHECKOUT ----------------
app.post('/create-checkout-session', async (req, res) => {
  const { items, email } = req.body;
  if (!email) return res.status(400).json({ error: 'User must be logged in to buy' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/shop.html`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- WEBHOOK FOR PAID ORDERS ----------------
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    let orders = [];
    if (fs.existsSync(ORDERS_FILE)) orders = JSON.parse(fs.readFileSync(ORDERS_FILE));

    orders.push({
      email: session.customer_email,
      items: session.display_items || [],
      total: session.amount_total / 100,
      paid: true
    });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  }

  res.json({ received: true });
});

// ---------------- OWNER ORDERS ----------------
app.get('/owner/orders', (req, res) => {
  if (!fs.existsSync(ORDERS_FILE)) return res.json([]);
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
  res.json(orders.filter(o => o.paid));
});

// ---------------- OWNER PRODUCTS ----------------
app.get('/owner/products', (req, res) => {
  if (!fs.existsSync(PRODUCTS_FILE)) return res.json([]);
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  res.json(products);
});

app.post('/owner/products', (req, res) => {
  const { action, product } = req.body;
  let products = [];
  if (fs.existsSync(PRODUCTS_FILE)) products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));

  if (action === 'add') products.push(product);
  if (action === 'remove') products = products.filter(p => p.id !== product.id);
  if (action === 'edit') {
    products = products.map(p => p.id === product.id ? product : p);
  }

  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ message: 'Products updated' });
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));