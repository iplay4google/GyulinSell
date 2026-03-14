// public/js/shop.js

const buyButtons = document.querySelectorAll(".buy-btn");
const user = JSON.parse(localStorage.getItem("user"));
const isGuest = localStorage.getItem("isGuest") === "true";

buyButtons.forEach(btn => {
  btn.addEventListener("click", async () => {

    // prevent guests from buying
    if (isGuest || !user) {
      alert("Guests cannot buy products. Please login first.");
      return;
    }

    const productName = btn.dataset.name;
    const productPrice = parseInt(btn.dataset.price);

    try {
      const response = await fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              name: productName,
              price: productPrice,
              quantity: 1
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Checkout error");
        return;
      }

      // redirect to Stripe checkout
      window.location.href = data.url;

    } catch (error) {
      console.error("Checkout error:", error);
      alert("Server error. Try again later.");
    }

  });
});