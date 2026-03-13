const express = require('express');
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Serve all files in your project folder
app.use(express.static(path.join(__dirname)));

// Ensure orders.json exists
const ordersFile = 'orders.json';
if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, '{}');
}
let paidOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));

// Stripe checkout
app.post('/create-checkout-session', async (req, res) => {
    const { amount, items, username } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map(i => ({
            price_data: {
                currency: 'eur',
                product_data: { name: i.name },
                unit_amount: i.price * 100
            },
            quantity: 1
        })),
        mode: 'payment',
        success_url: 'http://localhost:3000/success.html',
        cancel_url: 'http://localhost:3000/cancel.html',
    });

    // Save paid order in local JSON (simplified for testing)
    if (!paidOrders[username]) paidOrders[username] = [];
    paidOrders[username].push({ items, total: amount / 100, paid: true });
    fs.writeFileSync(ordersFile, JSON.stringify(paidOrders, null, 2));

    res.json({ id: session.id });
});

// Optional: redirect / to shop.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));