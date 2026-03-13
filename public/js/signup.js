// public/signup.js
const form = document.getElementById('signupForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !email || !password) {
    alert('All fields are required!');
    return;
  }

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      window.location.href = '/login.html';
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error signing up');
  }
});
