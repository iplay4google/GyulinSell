let isGuest = false;

// Dummy products array (replace with your server data)
const products = [
  { id: 1, name: "Product 1", price: 10 },
  { id: 2, name: "Product 2", price: 15 },
  { id: 3, name: "Product 3", price: 20 }
];

const productsContainer = document.getElementById("productsContainer");
const guestBtn = document.getElementById("guestBtn");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");

// Render products
function renderProducts() {
  productsContainer.innerHTML = "";
  products.forEach(product => {
    const productDiv = document.createElement("div");
    productDiv.className = "product";
    productDiv.innerHTML = `
      <h3>${product.name}</h3>
      <p>Price: €${product.price}</p>
    `;
    
    if (!isGuest) {
      const buyBtn = document.createElement("button");
      buyBtn.textContent = "Buy";
      buyBtn.onclick = () => alert(`You bought ${product.name}!`);
      productDiv.appendChild(buyBtn);
    }
    
    productsContainer.appendChild(productDiv);
  });
}

// Guest button click
guestBtn.onclick = () => {
  isGuest = true;
  renderProducts();
  alert("You joined as a guest. You can browse products but cannot buy.");
}

// Sign In button click
signInBtn.onclick = () => {
  isGuest = false;
  renderProducts();
  alert("Sign in clicked. Implement your login here.");
}

// Sign Up button click
signUpBtn.onclick = () => {
  isGuest = false;
  renderProducts();
  alert("Sign up clicked. Implement your signup here.");
}

// Initial render
renderProducts();