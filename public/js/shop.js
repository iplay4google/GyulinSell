const buyButtons = document.querySelectorAll(".buy-btn");
const isGuest = localStorage.getItem("isGuest") === "true";

buyButtons.forEach(btn => {
    btn.addEventListener("click", async () => {
        if (isGuest) {
            alert("Guests cannot buy products.");
            return;
        }

        const items = [{
            price_data: {
                currency: "usd",
                product_data: { name: "Product 1" },
                unit_amount: parseInt(btn.dataset.price)
            },
            quantity: 1
        }];

        const res = await fetch("/create-checkout-session", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ items, isGuest: false })
        });
        const data = await res.json();
        window.location = data.url;
    });
});