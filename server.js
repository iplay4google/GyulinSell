require('dotenv').config();
const express = require('express');
const fs = require('fs');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

const ORDERS_FILE = './orders.json';
const PRODUCTS_FILE = './products.json';

// Owner authentication
function checkOwner(req, res, next) {
    const { email, password } = req.body;
    if (email === process.env.OWNER_EMAIL && password === process.env.OWNER_PASSWORD) next();
    else res.status(403).json({ error: "Not authorized" });
}

// Load products
app.get('/products', (req, res) => {
    const products = fs.existsSync(PRODUCTS_FILE) ? JSON.parse(fs.readFileSync(PRODUCTS_FILE)) : [];
    res.json(products);
});

// Add product (owner)
app.post('/owner/products/add', checkOwner, (req, res) => {
    const products = fs.existsSync(PRODUCTS_FILE) ? JSON.parse(fs.readFileSync(PRODUCTS_FILE)) : [];
    products.push(req.body); // {name, price, description}
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });
});

// Edit product (owner)
app.post('/owner/products/edit', checkOwner, (req, res) => {
    const { index, updates } = req.body;
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    products[index] = { ...products[index], ...updates };
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });
});

// Remove product (owner)
app.post('/owner/products/remove', checkOwner, (req, res) => {
    const { index } = req.body;
    const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
    products.splice(index, 1);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });
});

// Create Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    if (req.body.isGuest) return res.status(403).json({ error: "Guests cannot buy" });
    try {
        const items = req.body.items.map(i => ({
            price_data: {
                currency: 'usd',
                product_data: { name: i.name },
                unit_amount: i.price * 100
            },
            quantity: i.quantity
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items,
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
app.post('/webhook', express.raw({type:'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch(err){
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if(event.type === 'checkout.session.completed'){
        const session = event.data.object;
        let orders = fs.existsSync(ORDERS_FILE) ? JSON.parse(fs.readFileSync(ORDERS_FILE)) : [];
        orders.push({
            name: session.customer_details.name,
            email: session.customer_details.email,
            items: session.display_items || [],
            total: session.amount_total/100
        });
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    }

    res.json({received:true});
});

// Owner orders page
app.post('/owner/orders', checkOwner, (req, res) => {
    const orders = fs.existsSync(ORDERS_FILE) ? JSON.parse(fs.readFileSync(ORDERS_FILE)) : [];
    res.json(orders);
});

// Remove order (owner)
app.post('/owner/orders/remove', checkOwner, (req,res)=>{
    const { index } = req.body;
    let orders = JSON.parse(fs.readFileSync(ORDERS_FILE));
    orders.splice(index,1);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders,null,2));
    res.json({success:true});
});

app.listen(process.env.PORT || 3000, ()=>console.log("Server running on port", process.env.PORT || 3000));