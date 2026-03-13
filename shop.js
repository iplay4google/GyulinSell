// Sample products data
const products = [
  { id: 1, name: "Product 1", price: "$10" },
  { id: 2, name: "Product 2", price: "$15" },
  { id: 3, name: "Product 3", price: "$20" },
  { id: 4, name: "Product 4", price: "$25" },
];

// Render products in the main area
const productsDiv = document.getElementById("products");
products.forEach(product => {
  const div = document.createElement("div");
  div.className = "product";
  div.innerHTML = `<h3>${product.name}</h3><p>${product.price}</p>`;
  productsDiv.appendChild(div);
});

// Button functionality
document.getElementById('guestBtn').addEventListener('click', () => {
  alert("Guest mode enabled. You can view products but can't buy.");
});

document.getElementById('signInBtn').addEventListener('click', () => {
  alert("Redirect to Sign In page (add your actual login functionality here).");
});

document.getElementById('signUpBtn').addEventListener('click', () => {
  alert("Redirect to Sign Up page (add your actual registration functionality here).");
});