app.post("/login", async (req,res)=>{

const { identifier, password } = req.body;

/* OWNER LOGIN */

if(identifier === "Owner3123" && password === "fTbo2bfIp3ThvyGC"){
return res.json({
role:"owner",
username:"Owner"
});
}

/* NORMAL USERS */

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