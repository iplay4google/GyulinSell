const OWNER_EMAIL = "Owner3123";
const OWNER_PASSWORD = "fTbo2bfIp3ThvyGC";

async function loadOrders(){
    const res = await fetch("/owner/orders", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email:OWNER_EMAIL, password:OWNER_PASSWORD})
    });
    const orders = await res.json();
    const container = document.getElementById("orders");
    container.innerHTML = "";
    orders.forEach((o,i)=>{
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${o.name}</strong> (${o.email})<br>
            Items: ${JSON.stringify(o.items)}<br>
            Total: $${o.total}<br>
            <button onclick="removeOrder(${i})">Remove Order</button>
        `;
        container.appendChild(div);
    });
}

async function removeOrder(index){
    await fetch("/owner/orders/remove", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({email:OWNER_EMAIL,password:OWNER_PASSWORD,index})
    });
    loadOrders();
}

// Products management
async function loadProducts(){
    const res = await fetch("/products");
    const products = await res.json();
    const container = document.getElementById("products");
    container.innerHTML = "";
    products.forEach((p,i)=>{
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${p.name}</strong> - $${p.price}<br>
            Description: ${p.description}<br>
            <button onclick="removeProduct(${i})">Remove</button>
            <button onclick="editProduct(${i})">Edit</button>
        `;
        container.appendChild(div);
    });
}

async function addProduct(){
    const name = document.getElementById("prodName").value;
    const price = parseFloat(document.getElementById("prodPrice").value);
    const description = document.getElementById("prodDesc").value;
    await fetch("/owner/products/add",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:OWNER_EMAIL,password:OWNER_PASSWORD,name,price,description})
    });
    loadProducts();
}

async function removeProduct(index){
    await fetch("/owner/products/remove",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:OWNER_EMAIL,password:OWNER_PASSWORD,index})
    });
    loadProducts();
}

async function editProduct(index){
    const name = prompt("New name:");
    const price = prompt("New price:");
    const description = prompt("New description:");
    await fetch("/owner/products/edit",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:OWNER_EMAIL,password:OWNER_PASSWORD,index,updates:{name,price,description}})
    });
    loadProducts();
}

document.getElementById("addProd").addEventListener("click", addProduct);

loadOrders();
loadProducts();