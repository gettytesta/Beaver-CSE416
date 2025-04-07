// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { InvestmentTypeSchema } = require('./investmentType');

// Enum for account tax status
// MIGHT NEED TO BE MOVED, DEPENDING ON WHERE THIS IS NEEDED
const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "nonretirement",
    PRE_TAX_RETIREMENT: "pretaxretirement",
    POST_TAX_RETIREMENT: "posttaxretirement",
});

var InvestmentSchema = new Schema({
    type: {type: InvestmentTypeSchema, required: true},
    value: {type: Number, required: true},
    accountTaxStatus: {
        type: String,
        enum: Object.values(AccountTaxStatus),
        required: true,
    },
})

module.exports = mongoose.model('Investment', InvestmentSchema)