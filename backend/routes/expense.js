const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js'); // We will need auth for these routes

// Import all the functions from your controller
const { 
    getExpenses, 
    addExpense, 
    updateExpense, 
    deleteExpense 
} = require('../controllers/expensecontroller.js');

// Map the controller functions to the routes your frontend is calling

// Frontend calls: POST /api/expense/add
// Note: Your controller is already named 'addExpense', so this is perfect.
// But your frontend script.js [12] calls /api/expense/add
// Your controller [15] doesn't use auth, but it should.
router.post("/add", auth, addExpense);

// Frontend calls: GET /api/expense/${userId}
// We can get the userId from the auth middleware (req.user.id)
// Let's change this route to be simpler and more secure
// It's better to get expenses for the *logged-in user*
router.get("/", auth, getExpenses);

// Frontend calls: DELETE /api/expense/${id}
router.delete("/:id", auth, deleteExpense);

// This route wasn't used, but here is how you would add it
router.put("/:id", auth, updateExpense);


module.exports = router;