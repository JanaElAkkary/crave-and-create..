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

server.post('/recipe/add', (req, res) => {
    // Extract recipe details from the request body
    const {
        recipename,
        description,
        ingredients,
        timetoprepare,
        dietary_details,
        category,
        flavor_profile,
        cooking_time,
        difficulty,
        user_id,
    } = req.body;

    // Check for missing required fields
    if (
        !recipename ||
        !description ||
        !ingredients ||
        !timetoprepare ||
        !dietary_details ||
        !category ||
        !flavor_profile ||
        !cooking_time ||
        !difficulty ||
        !user_id
    ) {
        return res
            .status(400)
            .send("All fields are required: recipename, description, ingredients, timetoprepare, dietary_details, category, flavor_profile, cooking_time, difficulty, user_id.");
    }

    // SQL query to insert a new recipe
    const insertQuery = `
        INSERT INTO recipe (
            recipename,
            description,
            ingredients,
            timetoprepare,
            dietary_details,
            category,
            flavor_profile,
            cooking_time,
            difficulty,
            user_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    db.run(
        insertQuery,
        [
            recipename,
            description,
            ingredients,
            timetoprepare,
            dietary_details,
            category,
            flavor_profile,
            cooking_time,
            difficulty,
            user_id,
        ],
        function (err) {
            if (err) {
                console.error("Error adding recipe:", err.message);
                return res.status(500).send(`Error adding recipe: ${err.message}`);
            }
            res.send({ message: "Recipe added successfully", recipe_id: this.lastID });
        }
    );
});



// Search Recipes
server.get('/search', (req, res) => {
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

// Update Recipe
server.put('/recipes/:id', (req, res) => {
    const { id } = req.params;
    const {
        recipename,
        description,
        ingredients,
        timetoprepare,
        dietary_details,
        category,
        flavor_profile,
        cooking_time,
        difficulty,
    } = req.body;

    const updateQuery = `
        UPDATE recipe 
        SET recipename = ?,
            description = ?,
            ingredients = ?,
            timetoprepare = ?,
            dietary_details = ?,
            category = ?,
            flavor_profile = ?,
            cooking_time = ?,
            difficulty = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(
        updateQuery,
        [
            recipename,
            description,
            ingredients,
            timetoprepare,
            dietary_details,
            category,
            flavor_profile,
            cooking_time,
            difficulty,
            id
        ],
        function(err) {
            if (err) return res.status(500).send("Error updating recipe: " + err.message);
            if (this.changes === 0) return res.status(404).send("Recipe not found");
            res.send("Recipe updated successfully");
        }
    );
});

// Delete Recipe
server.delete('/recipes/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM recipe WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).send("Error deleting recipe: " + err.message);
        if (this.changes === 0) return res.status(404).send("Recipe not found");
        res.send("Recipe deleted successfully");
    });
});

// User Preferences CRUD
server.post('/user-preferences', (req, res) => {
    const { user_id, preferences } = req.body;
    
    if (!user_id || !preferences) {
        return res.status(400).send("User ID and preferences are required");
    }

    const query = 'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?)';
    db.run(query, [user_id, JSON.stringify(preferences)], function(err) {
        if (err) return res.status(500).send("Error saving preferences: " + err.message);
        res.send({ message: "Preferences saved", id: this.lastID });
    });
});

server.get('/user-preferences/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.get('SELECT * FROM user_preferences WHERE user_id = ?', [userId], (err, row) => {
        if (err) return res.status(500).send("Error fetching preferences: " + err.message);
        if (!row) return res.status(404).send("Preferences not found");
        res.send({ ...row, preferences: JSON.parse(row.preferences) });
    });
});

server.put('/user-preferences/:userId', (req, res) => {
    const { userId } = req.params;
    const { preferences } = req.body;
    
    const query = 'UPDATE user_preferences SET preferences = ? WHERE user_id = ?';
    db.run(query, [JSON.stringify(preferences), userId], function(err) {
        if (err) return res.status(500).send("Error updating preferences: " + err.message);
        if (this.changes === 0) return res.status(404).send("Preferences not found");
        res.send("Preferences updated successfully");
    });
});

// Community Recipes CRUD
server.post('/community-recipes', (req, res) => {
    const { user_id, recipe_name, description, ingredients, cooking_time, difficulty } = req.body;
    
    if (!user_id || !recipe_name || !description || !ingredients || !cooking_time || !difficulty) {
        return res.status(400).send("All fields are required");
    }

    const query = `
        INSERT INTO community_recipes 
        (user_id, recipe_name, description, ingredients, cooking_time, difficulty)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [user_id, recipe_name, description, ingredients, cooking_time, difficulty], 
        function(err) {
            if (err) return res.status(500).send("Error creating community recipe: " + err.message);
            res.send({ message: "Community recipe created", id: this.lastID });
    });
});

server.get('/community-recipes', (req, res) => {
    db.all('SELECT * FROM community_recipes ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).send("Error fetching community recipes: " + err.message);
        res.send(rows);
    });
});

server.get('/community-recipes/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM community_recipes WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send("Error fetching community recipe: " + err.message);
        if (!row) return res.status(404).send("Community recipe not found");
        res.send(row);
    });
});

// Comments CRUD
server.post('/comments', (req, res) => {
    const { recipe_id, user_id, comment } = req.body;
    
    if (!recipe_id || !user_id || !comment) {
        return res.status(400).send("Recipe ID, User ID and comment are required");
    }

    const query = 'INSERT INTO comments (recipe_id, user_id, comment) VALUES (?, ?, ?)';
    db.run(query, [recipe_id, user_id, comment], function(err) {
        if (err) return res.status(500).send("Error creating comment: " + err.message);
        res.send({ message: "Comment added", id: this.lastID });
    });
});

server.get('/recipes/:recipeId/comments', (req, res) => {
    const { recipeId } = req.params;
    
    db.all('SELECT * FROM comments WHERE recipe_id = ? ORDER BY created_at DESC', [recipeId], 
        (err, rows) => {
            if (err) return res.status(500).send("Error fetching comments: " + err.message);
            res.send(rows);
    });
});

server.delete('/comments/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).send("Error deleting comment: " + err.message);
        if (this.changes === 0) return res.status(404).send("Comment not found");
        res.send("Comment deleted successfully");
    });
});

// Pantry CRUD
server.post('/pantry', (req, res) => {
    const { user_id, ingredient_name, quantity } = req.body;
    
    if (!user_id || !ingredient_name || !quantity) {
        return res.status(400).send("User ID, ingredient name and quantity are required");
    }

    const query = 'INSERT INTO pantry (user_id, ingredient_name, quantity) VALUES (?, ?, ?)';
    db.run(query, [user_id, ingredient_name, quantity], function(err) {
        if (err) return res.status(500).send("Error adding pantry item: " + err.message);
        res.send({ message: "Pantry item added", id: this.lastID });
    });
});

server.get('/pantry/:userId', (req, res) => {
    const { userId } = req.params;
    
    db.all('SELECT * FROM pantry WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).send("Error fetching pantry items: " + err.message);
        res.send(rows);
    });
});

server.put('/pantry/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity) {
        return res.status(400).send("Quantity is required");
    }

    const query = 'UPDATE pantry SET quantity = ? WHERE id = ?';
    db.run(query, [quantity, id], function(err) {
        if (err) return res.status(500).send("Error updating pantry item: " + err.message);
        if (this.changes === 0) return res.status(404).send("Pantry item not found");
        res.send("Pantry item updated successfully");
    });
});

server.delete('/pantry/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM pantry WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).send("Error deleting pantry item: " + err.message);
        if (this.changes === 0) return res.status(404).send("Pantry item not found");
        res.send("Pantry item deleted successfully");
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});