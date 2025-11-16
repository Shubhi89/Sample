const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true,
        trim: true
    },
}, { timestamps: true }); // timestamps adds createdAt and updatedAt

module.exports = mongoose.model('Expense', expenseSchema);