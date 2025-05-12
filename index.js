const express = require('express')
const bodyParser = require('body-parser')
const ejs = require("ejs")
const encrypt = require('mongoose-encryption')

const app = express()
app.set("view engine","ejs")
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/secrets");
const trySchema = new mongoose.Schema({
    email: String,
    password: String
});
const secret = "thisislittlesecret";
trySchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
const item = mongoose.model("second",trySchema);

app.get("/",function(req,res){
    res.render("home")
});

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await item.findOne({ email: username });

        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            } else {
                res.send("Incorrect password");
            }
        } else {
            res.send("User not found");
        }
    } catch (err) {
        console.log("Login error:", err);
        res.send("Something went wrong");
    }
});

app.post("/register",function(req,res){
    const newUser = new item({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
    .then(() => {
        res.render("secrets");
    })
    .catch(err => {
        console.log(err);
        res.send("Error saving user");
    });

});


app.get("/login",function(req,res){
    res.render("login")
});
app.get("/register",function(req,res){
    res.render("register")
});

app.listen(5000,function(){
    console.log("server started")
});
