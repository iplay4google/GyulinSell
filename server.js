require('dotenv').config();
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());
app.use(express.static('public'));

const USERS_FILE = './users.json';
const PRODUCTS_FILE = './products.json';
const ORDERS_FILE = './orders.json';

// ------------------ SIGNUP ------------------
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });

  let users = [];
  if (fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE));

  // check if user exists
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already registered' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hashedPassword });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  res.json({ message: 'Signup successful' });
});

// ------------------ LOGIN ------------------
app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ message: 'All fields required' });

  let users = [];
  if (fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE));

  // owner hardcoded
  const owner = { name: 'Owner3123', password: 'fTbo2bfIp3ThvyGC' };
  if (identifier === owner.name && password === owner.password) return res.json({ role: 'owner', name: owner.name });

  // normal user
  const user = users.find(u => u.email === identifier || u.name === identifier);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Wrong password' });

  res.json({ role: 'user', name: user.name, email: user.email });
});

// ------------------ GET PRODUCTS ------------------
app.get('/products', (req, res) => {
  if (!fs.existsSync(PRODUCTS_FILE)) return res.json([]);
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  res.json(products);
});

// ------------------ ADD PRODUCT (OWNER ONLY) ------------------
app.post('/owner/add-product', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'Missing name or price' });

  let products = [];
  if (fs.existsSync(PRODUCTS_FILE)) products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  products.push({ name, price });
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ message: 'Product added', products });
});

// ------------------ DELETE PRODUCT ------------------
app.post('/owner/delete-product', (req, res) => {
  const { name } = req.body;
  if (!fs.existsSync(PRODUCTS_FILE)) return res.status(404).json({ message: 'No products file' });

  let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
  products = products.filter(p => p.name !== name);
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  res.json({ message: 'Product removed', products });
});

// ------------------ SERVER ------------------
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});
