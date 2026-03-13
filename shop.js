let isGuest = false;

// Handle "Join as Guest" button click
document.getElementById("guestBtn").addEventListener("click", () => {
    isGuest = true;
    loadProducts();
});

// Sample products array (replace with your real products if needed)
const products = [
    { name: "Product 1", price: 5 },
    { name: "Product 2", price: 10 },
    { name: "Product 3", price: 15 }
];

// Function to load products into the page
function loadProducts() {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    products.forEach(p => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        productDiv.innerHTML = `
            <h3>${p.name}</h3>
            <p>€${p.price}</p>
            <button class="buy-btn" ${isGuest ? 'style="display:none;"' : ''}>Buy</button>
        `;
        container.appendChild(productDiv);
    });

    // Optional: show message for guests
    if (isGuest) {
        const msg = document.createElement("p");
        msg.style.color = "red";
        msg.textContent = "You are browsing as a guest. Buy buttons are disabled.";
        container.prepend(msg);
    }
}

// Initial load for normal visitors
loadProducts();