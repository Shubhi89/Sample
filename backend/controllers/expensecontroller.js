const Expense = require('../models/expense');

// 🟢 Add a new expense
const addExpense = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { title, amount, category, date, description } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const expense = new Expense({
            title,
            amount,
            category,
            date,
            description,
            userId,
        });

        const savedExpense = await expense.save();
        res.status(201).json({ message: 'Expense added successfully', expense: savedExpense });
        console.log("added expense");
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🟡 Get all expenses for a user
const getExpenses = async (req, res) => {
    try {
        const { id: userId } = req.user;
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateExpense = async (req, res) => {
    try {
        const { id: expenseId } = req.params; // The expense ID
        const { id: userId } = req.user; // The user's ID
        const { title, amount, category } = req.body;

        if (!title || !amount || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find the expense and check if the user owns it
        const expense = await Expense.findOne({ _id: expenseId, userId: userId });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or user not authorized' });
        }

        // Update the fields
        expense.title = title;
        expense.amount = amount;
        expense.category = category;

        const updatedExpense = await expense.save();
        res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔴 Delete an expense
const deleteExpense = async (req, res) => {
    try {
        const { id: expenseId } = req.params; // The expense ID
        const { id: userId } = req.user; // The user's ID

        // Find the expense and check ownership
        const expense = await Expense.findOne({ _id: expenseId, userId: userId });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or user not authorized' });
        }
        
        await expense.deleteOne();
        
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
};

