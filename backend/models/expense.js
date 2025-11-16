const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Links to the User model
        required: true 
    },
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
    date: { // Also good to have
        type: Date, 
        default: Date.now 
    }, 
    description: { // Good to have
        type: String,
        trim: true
    }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt

module.exports = mongoose.model('Expense', expenseSchema);