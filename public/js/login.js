const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  // OWNER LOGIN
  if (data.role === "owner") {
    localStorage.setItem("role", "owner");
    window.location.href = "/owner.html";
    return;
  }

  // NORMAL USER LOGIN
  if (data.role === "user") {
    localStorage.setItem("user", JSON.stringify({
      username: data.username,
      email: data.email
    }));

    window.location.href = "/shop.html";
  }
});