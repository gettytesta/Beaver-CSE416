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
    single: {
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema],
    },
    marriedFilingJointly: {
        incomeTaxBrackets: [TaxBracketSchema],
        capitalGainsBrackets: [CapitalGainsBracketSchema],
    }
});

module.exports = mongoose.model('StateTax', StateTaxSchema); 