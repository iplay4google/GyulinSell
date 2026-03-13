// public/login.js
const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!identifier || !password) {
    alert('All fields are required!');
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();

    if (res.ok) {
      if (data.role === 'owner') {
        window.location.href = '/owner.html';
      } else if (data.role === 'user') {
        localStorage.setItem('user', JSON.stringify(data));
        window.location.href = '/shop.html';
      }
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error logging in');
  }
});
