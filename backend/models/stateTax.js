// State Tax Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { TaxBracketSchema } = require('./taxBracket');
const { CapitalGainsBracketSchema } = require('./capitalGainsBracket');

const StateTaxSchema = new Schema({
    stateCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        index: true
    },
    year: {
        type: Number,
        required: true
    },
    single: {
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema],
    },
    marriedFilingJointly: {
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
StateTaxSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('StateTax', StateTaxSchema); 