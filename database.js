const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const usertable =`CREATE TABLE IF NOT EXSISTS user (
id INTEGER PRIMARY KEY AUTOINCREMENET,
email TEXT NOT NULL,
fullname TEXT NOT NULL,
phonenumber INTEGER NOT NULL,
password TEXT NOT NULL
)`




db.serialize(()=> {
    db.run(usertable, (Error)=>{
        if (Error){
            console.error("Usertable creating failed", Error);
        }
        else{ 
        console.log("Usertable creating successful")
        }

    })

})
module.exports = {db,usertable}