require('dotenv').config();
const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

const ORDERS_FILE = './orders.json'; // stores paid orders

// Create Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: req.body.items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success.html`,
            cancel_url: `${process.env.FRONTEND_URL}/shop.html`,
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Stripe webhook to save paid orders
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''; // set this in Render if using webhook
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // Read existing orders
        let orders = [];
        if (fs.existsSync(ORDERS_FILE)) {
            orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
        }

        // Add new paid order
        orders.push({
            name: session.customer_details.name,
            email: session.customer_details.email,
            items: session.display_items || [],
            total: session.amount_total / 100
        });

        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    }

    res.json({received: true});
});

// Owner page data
app.get('/owner/orders', (req, res) => {
    if (!fs.existsSync(ORDERS_FILE)) return res.json([]);
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    res.json(orders);
});

app.listen(process.env.PORT || 3000, () => console.log('Server running on port', process.env.PORT || 3000));