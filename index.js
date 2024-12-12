const express = require('express');
const { db } = require('./database.js');
const server = express();
const port = 9999;

server.use(express.json());

// User Registration

server.post('/user/register', (req,res) => {
    let fullname = req.body.fullname;
    let email = req.body.email;
    // let phonenumber= parseInt(req.body.phonenumber,10);
    let phonenumber = req.body.phonenumber;
    let password = req.body.password;

    if (!fullname || !email || !phonenumber || !password){
        return res.send("the required fields are : full name, email, password, phone number ")
    }

    const insertquery = `INSERT INTO user (fullname, email, phonenumber, password) VALUES (?, ?, ?, ?)`;
    db.run(insertquery, [fullname, email, phonenumber, password], (err) => {
        if (err){
            return res.send("registration error:", err)

        }
        else{
            return res.send("account added successfully")
        }
    })

})




// User Login

server.post('/user/login', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email ||!password){

        return res.send("the required fields are : email, password")
    }

    const loginquery = `SELECT * FROM user WHERE email = ? AND password = ?`;
    db.get(loginquery, [email, password], (err, row) => {

        if (err) return res.status(500).send("Login error: " + err.message);

        if (row) {
            res.send("Logged in successfully");
        } else {
            res.status(401).send("Invalid email or password");
        }
    });

})

// Craving Search
server.post('/cravings', (req, res) => {
    const { keyword, mood, seasonal } = req.body;
    let query = `SELECT * FROM craving WHERE 1=1`;
    let params = [];

    if (keyword) {
        query += ` AND keyword LIKE ?`;
        params.push(`%${keyword}%`);
    }

    if (mood) {
        query += ` AND mood = ?`;
        params.push(mood);
    }

    if (seasonal) {
        query += ` AND seasonal = ?`;
        params.push(seasonal);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send("Error fetching cravings: " + err.message);
        res.send(rows);
    });
});

// Trending Cravings
server.get('/trending-cravings', (req, res) => {
    db.all(`SELECT * FROM trending_cravings ORDER BY popularity DESC LIMIT 10`, [], (err, rows) => {
        if (err) return res.status(500).send("Error fetching trending cravings: " + err.message);
        res.send(rows);
    });
});



server.listen(port, ()=> {
    console.log(`the server is listening correctly at port ${port}`);
