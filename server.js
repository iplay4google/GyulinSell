require('dotenv').config();
const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

const USERS_FILE = './users.json';
const ORDERS_FILE = './orders.json';
const PRODUCTS_FILE = './products.json';

// --------------------
// User authentication
// --------------------
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    let users = [];
    if(fs.existsSync(USERS_FILE)) users = JSON.parse(fs.readFileSync(USERS_FILE));

    if(users.find(u => u.username === username || u.email === email)){
        return res.json({ success: false, message: 'User already exists' });
    }

    users.push({ username, email, password, role: 'user' });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if(!fs.existsSync(USERS_FILE)) return res.json({ success: false, message: 'No users found' });

    const users = JSON.parse(fs.readFileSync(USERS_FILE));
    const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

    if(user) return res.json({ success: true, user });
    return res.json({ success: false, message: 'Invalid credentials' });
});

// --------------------
// Stripe checkout
// --------------------
app.post('/create-checkout-session', async (req, res) => {
    const user = req.body.user;
    if(!user || user.role === 'guest') return res.status(403).json({error: 'Guests cannot buy products'});

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: req.body.items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success.html`,
            cancel_url: `${process.env.FRONTEND_URL}/shop.html`,
            customer_email: user.email
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --------------------
// Owner management
// --------------------
app.get('/owner/orders', (req, res) => {
    if(!fs.existsSync(ORDERS_FILE)) return res.json([]);
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(orders.filter(o => o.paid)); // only show paid
});

app.post('/owner/remove-order', (req, res) => {
    const { id } = req.body;
    if(!fs.existsSync(ORDERS_FILE)) return res.json({ success: false });
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    orders = orders.filter(o => o.id !== id);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json({ success: true });
});

// --------------------
// Products API
// --------------------
app.get('/products', (req, res) => {
    if(!fs.existsSync(PRODUCTS_FILE)) return res.json([]);
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    res.json(products);
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));