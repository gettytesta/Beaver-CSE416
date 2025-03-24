// Federal Tax Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { TaxBracketSchema } = require('./taxBracket');
const { CapitalGainsBracketSchema } = require('./capitalGainsBracket');

const FederalTaxSchema = new Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    },
    single: {
        standardDeduction: {
            type: Number,
            required: true
        },
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema]
    },
    marriedFilingJointly: {
        standardDeduction: {
            type: Number,
            required: true
        },
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema]
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
FederalTaxSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('FederalTax', FederalTaxSchema);