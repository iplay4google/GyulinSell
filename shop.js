// Sample products
const products = [
  { id: 1, name: 'Product A', price: 10 },
  { id: 2, name: 'Product B', price: 20 },
];

const productsDiv = document.getElementById('products');
const cartUl = document.getElementById('cart');
const buyBtn = document.getElementById('buy');

let cart = [];

// Render products
products.forEach(product => {
  const div = document.createElement('div');
  div.innerHTML = `
    <strong>${product.name}</strong> - $${product.price}
    <button data-id="${product.id}">Add to cart</button>
  `;
  productsDiv.appendChild(div);

  div.querySelector('button').addEventListener('click', () => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
  });
});

// Render cart
function renderCart() {
  cartUl.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} x ${item.quantity} = $${item.price * item.quantity}`;
    cartUl.appendChild(li);
  });
}

// Buy button
buyBtn.addEventListener('click', async () => {
  if (cart.length === 0) return alert('Cart is empty');
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: cart })
  });
  const data = await response.json();
  if (data.url) window.location = data.url;
});