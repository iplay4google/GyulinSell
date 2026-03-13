const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

e.preventDefault();

const identifier = document.getElementById("identifier").value;
const password = document.getElementById("password").value;

const res = await fetch("/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ identifier, password })
});

const data = await res.json();

if(data.error){
alert(data.error);
return;
}

if(data.role === "owner"){
window.location.href = "/owner.html";
return;
}

if(data.role === "user"){
localStorage.setItem("user", JSON.stringify(data));
window.location.href = "/shop.html";
}

});