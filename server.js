require("dotenv").config();

const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const USERS_FILE = "./users.json";
const PRODUCTS_FILE = "./products.json";
const ORDERS_FILE = "./orders.json";

const OWNER_NAME = "Owner3123";
const OWNER_PASSWORD = "fTbo2bfIp3ThvyGC";


// ---------------- SAFE JSON FUNCTIONS ----------------

function readJSON(file) {
  try {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, "utf8");
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error("JSON read error:", err);
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}


// ---------------- HOME ----------------

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});


// ---------------- SIGNUP ----------------

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  let users = readJSON(USERS_FILE);

  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({
    name,
    email,
    password: hashedPassword
  });

  writeJSON(USERS_FILE, users);

  res.json({ message: "Signup successful" });
});


// ---------------- LOGIN ----------------

app.post("/login", async (req, res) => {

  const { identifier, password } = req.body;

  if (!identifier || !password)
    return res.status(400).json({ message: "All fields required" });

  // owner login
  if (identifier === OWNER_NAME && password === OWNER_PASSWORD) {
    return res.json({
      role: "owner",
      name: OWNER_NAME
    });
  }

  let users = readJSON(USERS_FILE);

  const user = users.find(
    u => u.email === identifier || u.name === identifier
  );

  if (!user)
    return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match)
    return res.status(401).json({ message: "Wrong password" });

  res.json({
    role: "user",
    name: user.name,
    email: user.email
  });
});


// ---------------- PRODUCTS ----------------

app.get("/products", (req, res) => {

  const products = readJSON(PRODUCTS_FILE);

  res.json(products);

});


// ---------------- OWNER ADD PRODUCT ----------------

app.post("/owner/products/add", (req, res) => {

  const { name, price, description } = req.body;

  if (!name || !price)
    return res.status(400).json({ message: "Missing name or price" });

  let products = readJSON(PRODUCTS_FILE);

  products.push({
    name,
    price,
    description
  });

  writeJSON(PRODUCTS_FILE, products);

  res.json({ message: "Product added" });

});


// ---------------- OWNER REMOVE PRODUCT ----------------

app.post("/owner/products/remove", (req, res) => {

  const { index } = req.body;

  let products = readJSON(PRODUCTS_FILE);

  products.splice(index, 1);

  writeJSON(PRODUCTS_FILE, products);

  res.json({ message: "Product removed" });

});


// ---------------- OWNER EDIT PRODUCT ----------------

app.post("/owner/products/edit", (req, res) => {

  const { index, updates } = req.body;

  let products = readJSON(PRODUCTS_FILE);

  products[index] = {
    ...products[index],
    ...updates
  };

  writeJSON(PRODUCTS_FILE, products);

  res.json({ message: "Product updated" });

});


// ---------------- STRIPE CHECKOUT ----------------

// ---------------- STRIPE CHECKOUT ----------------

app.post("/create-checkout-session", async (req, res) => {

  try {

    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name
          },

          // convert dollars to cents
          unit_amount: Math.round(item.price * 100)

        },
        quantity: item.quantity
      })),

      mode: "payment",

      success_url: "https://gyulinsell.onrender.com/success.html",

      cancel_url: "https://gyulinsell.onrender.com/shop.html"

    });

    res.json({ url: session.url });

  } catch (err) {

    console.error(err);

    res.status(500).json({ message: "Stripe checkout error" });

  }

});

// ---------------- SERVER ----------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("Server running on port", PORT);

});