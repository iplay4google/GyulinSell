// public/js/login.js

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!identifier || !password) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // save user session
    localStorage.setItem("user", JSON.stringify(data));

    // redirect based on role
    if (data.role === "owner") {
      window.location.href = "/owner.html";
    } else {
      window.location.href = "/shop.html";
    }

  } catch (error) {
    console.error("Login error:", error);
    alert("Server error. Try again later.");
  }
});