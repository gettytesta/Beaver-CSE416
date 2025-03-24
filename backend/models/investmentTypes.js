const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Investment Type Schema FOR LATERRRRRRRRRRR
const InvestmentTypeSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true // Ensure investment types have unique names
    },
    description: { 
        type: String, 
        required: true 
    },
    returnAmtOrPct: {
        type: String,
        enum: ['amount', 'percent'], // Whether expected annual return is a fixed amount or percentage
        required: true
    },
    returnDistribution: {
        type: Schema.Types.Mixed, // This could be a reference to a distribution schema if needed
        required: true
    },
    expenseRatio: {
        type: Number,
        required: true
    },
    incomeAmtOrPct: {
        type: String,
        enum: ['amount', 'percent'], // Whether income is a fixed amount or percentage
        required: true
    },
    incomeDistribution: {
        type: Schema.Types.Mixed, // Could be a reference to a distribution schema if needed
        required: true
    },
    taxability: {
        type: Boolean, // If the investment is taxable or tax-exempt
        required: true
    }
});

// Creating the model
module.exports = mongoose.model('InvestmentType', InvestmentTypeSchema);