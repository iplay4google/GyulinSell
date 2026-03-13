document.addEventListener('DOMContentLoaded', () => {
    const stripe = Stripe('pk_test_51TAFbYJWa2hSujubEpga5DiWoz6ppOBYdaCHkSCNRS5s6iszioXAxldWtYNdr9a9DSn6N5XURu3eb7kRffHmKkEw00qhe0uBsR');

    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const item = {
                price_data: {
                    currency: 'usd',
                    product_data: { name: button.dataset.name },
                    unit_amount: parseInt(button.dataset.price)
                },
                quantity: 1
            };

            const res = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ items: [item] })
            });

            const data = await res.json();
            window.location.href = data.url; // redirect to Stripe Checkout
        });
    });

    // Auth buttons (guest/login/signup)
    document.getElementById('guest-btn').onclick = () => alert('Browsing as guest');
    document.getElementById('login-btn').onclick = () => window.location.href = 'login.html';
    document.getElementById('signup-btn').onclick = () => window.location.href = 'signup.html';
});