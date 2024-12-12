const express = require('express');
const { db } = require('./database.js');
const server = express();
const port = 9999;

server.use(express.json());

// User Registration

server.post('/user/register', (req,res) => {
    let fullname = req.body.fullname;
    let email = req.body.email;
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

// Search Recipes
server.post('/search', (req, res) => {
    const { keyword, category } = req.body;
    let query = `SELECT * FROM recipe WHERE recipename LIKE ? OR description LIKE ?`;
    let params = [`%${keyword}%`, `%${keyword}%`];

    if (category) {
        query += ` AND category = ?`;
        params.push(category);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send("Error fetching recipes: " + err.message);
        res.send(rows);
    });
});

// Retrieve Recipe Details
server.get('/recipes/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM recipe WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send("Error fetching recipe: " + err.message);
        if (!row) return res.status(404).send("Recipe not found");
        res.send(row);
    });
});

// Add a Recipe Review
server.post('/recipes/:id/review', (req, res) => {
    const { id } = req.params;
    const { userId, review } = req.body;

    if (!userId || !review) {
        return res.status(400).send("The required fields are: userId, review");
    }

    const insertReviewQuery = `INSERT INTO reviews (recipe_id, user_id, review) VALUES (?, ?, ?)`;
    db.run(insertReviewQuery, [id, userId, review], (err) => {
        if (err) return res.status(500).send("Error adding review: " + err.message);
        res.send("Review added successfully");
    });
});

// Retrieve Reviews for a Recipe
server.get('/recipes/:id/reviews', (req, res) => {
    const { id } = req.params;

    const getReviewsQuery = `SELECT * FROM reviews WHERE recipe_id = ?`;
    db.all(getReviewsQuery, [id], (err, rows) => {
        if (err) return res.status(500).send("Error fetching reviews: " + err.message);
        res.send(rows);
    });
});

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

// Meal Plan Creation
server.post('/meal-plan', (req, res) => {
    const { userId, planName, meals } = req.body;

    if (!userId || !planName || !meals) {
        return res.status(400).send("The required fields are: userId, planName, meals");
    }

    const insertMealPlanQuery = `INSERT INTO meal_plan (user_id, plan_name, meals) VALUES (?, ?, ?)`;
    db.run(insertMealPlanQuery, [userId, planName, JSON.stringify(meals)], (err) => {
        if (err) return res.status(500).send("Error creating meal plan: " + err.message);
        res.send("Meal plan created successfully");
    });
});

// Retrieve Meal Plan
server.get('/meal-plan/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM meal_plan WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).send("Error fetching meal plan: " + err.message);
        if (!row) return res.status(404).send("Meal plan not found");
        res.send({ ...row, meals: JSON.parse(row.meals) });
    });
});

// Pantry Search
server.post('/pantry', (req, res) => {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
        return res.status(400).send("The required field is: ingredients (array)");
    }

    const placeholders = ingredients.map(() => '?').join(' OR ingredients LIKE ');
    const query = `SELECT * FROM recipe WHERE ingredients LIKE ${placeholders}`;
    const params = ingredients.map(ingredient => `%${ingredient}%`);

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).send("Error fetching pantry recipes: " + err.message);
        res.send(rows);
    });
})


server.listen(port, ()=> {
    console.log(`the server is listening correctly at port ${port}`);
});