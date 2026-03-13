require("dotenv").config();

const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.json());
app.use(express.static("public"));

/* LOGIN ROUTE */

app.post("/login", async (req,res)=>{

const { identifier, password } = req.body;

if(identifier === "Owner3123" && password === "fTbo2bfIp3ThvyGC"){
return res.json({
role:"owner",
username:"Owner"
});
}

let users = [];

if(fs.existsSync("./users.json")){
users = JSON.parse(fs.readFileSync("./users.json"));
}

const user = users.find(
u => u.email === identifier || u.username === identifier
);

if(!user){
return res.json({error:"User not found"});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.json({error:"Wrong password"});
}

res.json({
role:"user",
username:user.username,
email:user.email
});

});

/* START SERVER */

app.listen(process.env.PORT || 3000, ()=>{
console.log("Server running");
});