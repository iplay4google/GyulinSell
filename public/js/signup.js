// signup.js
const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.success) {
      alert('Account created! You can now log in.');
      window.location.href = '/login.html';
    } else {
      alert(data.error || 'Something went wrong');
    }
  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
});
