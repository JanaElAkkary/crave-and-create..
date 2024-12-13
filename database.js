const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const createusertable =`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    fullname TEXT NOT NULL,
    phonenumber TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`

const createrecipetable = `CREATE TABLE IF NOT EXISTS recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipename TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    timetoprepare TEXT NOT NULL,
    dietary_details TEXT NOT NULL,
    category TEXT NOT NULL,
    flavor_profile TEXT NOT NULL,
    cooking_time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`
const createcravingtable =`CREATE TABLE IF NOT EXISTS craving (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    mood TEXT NOT NULL,
    seasonal TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`
const createreviewTable =`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
   recipe_id INTEGER NOT NULL,
   user_id INTEGER NOT NULL,
   review TEXT NOT NULL,
   created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   )`
   const createUserPreferencesTable = `CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    preferences TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`;
const createMealPlanTable = `CREATE TABLE IF NOT EXISTS meal_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_name TEXT NOT NULL,
    meals JSON NOT NULL, -- JSON array to store meal IDs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`;
const createCommunityRecipesTable = `CREATE TABLE IF NOT EXISTS community_recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipe_name TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    cooking_time TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`;
const createCommentsTable = `CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipe(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
)`;

const createPantryTable = `CREATE TABLE IF NOT EXISTS pantry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ingredient_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`;





   db.serialize(() => {
    db.run(createusertable, (err) => {
        if (err) console.error("Usertable creating failed", err.message);
        else console.log("Usertable created successfully");
    });

    db.run(createrecipetable, (err) => {
        if (err) console.error("Recipe table creating failed", err.message);
        else console.log("Recipe table created successfully");
    });

    db.run(createcravingtable, (err) => {
        if (err) console.error("Craving table creating failed", err.message);
        else console.log("Craving table created successfully");
    });

    db.run(createreviewTable, (err) => {
        if (err) console.error("Review table creating failed", err.message);
        else console.log("Review table created successfully");
    });

    db.run(createUserPreferencesTable, (err) => {
        if (err) console.error("User preferences table creating failed", err.message);
        else console.log("User preferences table created successfully");
    });

    db.run(createMealPlanTable, (err) => {
        if (err) console.error("Meal plan table creating failed", err.message);
        else console.log("Meal plan table created successfully");
    });

    db.run(createCommunityRecipesTable, (err) => {
        if (err) console.error("Community recipes table creating failed", err.message);
        else console.log("Community recipes table created successfully");
    });

    db.run(createCommentsTable, (err) => {
        if (err) console.error("Comments table creating failed", err.message);
        else console.log("Comments table created successfully");
    });

    db.run(createPantryTable, (err) => {
        if (err) console.error("Pantry table creating failed", err.message);
        else console.log("Pantry table created successfully");
    });
});

module.exports = { db };