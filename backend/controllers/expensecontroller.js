const Expense = require('../models/expense');

// 🟢 Add a new expense
const addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description, userId } = req.body;

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
        const { userId } = req.user.id;
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔵 Update an expense
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExpense = await Expense.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });
        console.log("updated expense");
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// 🔴 Delete an expense
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExpense = await Expense.findByIdAndDelete(id);
        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.status(200).json({ message: 'Expense deleted successfully' });
        console.log("deleted expense");
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
};

