const express = require ('express');
// const db = require ('./database.js');
const server = express();
const port = 9999;
server.use(express.json());
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');


const createrecipetable = `CREATE TABLE IF NOT EXISTS recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipename TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    timetoprepare TEXT NOT NULL,
    dietary_details TEXT NOT NULL,
    catgory TEXT NOT NULL,
    flavor_profile TEXT NOT NULL,
    cooking_time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`


server.post('/user/register', (req,res) => {
    let fullname = req.body.fullname;
    let email = req.body.email;
    // let phonenumber= parseInt(req.body.phonenumber,10);
    let phonenumber = req.body.phonenumber;
    let password = req.body.password;

    if (!fullname || !email || !phonenumber || !password){
        return res.send("the required fields are : full name, email, password, phone number ")
    }

    const insertquery= `INSERT INTO user(fullname, email, password, phonenumber) VALUES ('${fullname}','${email}','${password}','${phonenumber}' )`
    db.run(insertquery, (err)=>{
        if (err){
            return res.send("registration error:", err)

        }
        else{
            return res.send("account added successfully")
        }
    })

})






server.post('/user/login', (req,res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email ||!password){

        return res.send("the required fields are : email, password")
    }

    const loginquery= `SELECT *FROM user WHERE email = '${email}' AND  password ='${password}'`
    db.get (loginquery, (err)=>{
        if (err){
            return res.send("login error:", err)

        }
        else{
            return res.send("logged in successfully")
        }
    })

})



server.listen(port, ()=> {
    console.log(`the server is listening correctly at port ${port}`);

db.serialize(()=> {
    db.run(createUserTable, (Error)=>{
        if (Error){
            console.error("Usertable creating failed", Error);
        }
        else{ 
        console.log("Usertable creating successful")
        }

    })
})
})
