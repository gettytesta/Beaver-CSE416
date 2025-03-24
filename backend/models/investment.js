// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Enum for account tax status
// MIGHT NEED TO BE MOVED, DEPENDING ON WHERE THIS IS NEEDED
const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "nonretirement",
    PRE_TAX_RETIREMENT: "pretaxretirement",
    POST_TAX_RETIREMENT: "posttaxretirement",
});

var InvestmentSchema = new Schema({
    // TODO - TYPE
    value: {type: Number, required: true},
    accountTaxStatus: {
        type: String,
        enum: Object.values(AccountTaxStatus),
        required: true,
    },
})

module.exports = mongoose.model('Investment', InvestmentSchema)