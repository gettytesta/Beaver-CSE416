// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { InvestmentTypeSchema } = require('./investmentType');


const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "non-retirement",
    PRE_TAX_RETIREMENT: "pre-tax",
    POST_TAX_RETIREMENT: "after-tax",
});

var InvestmentSchema = new Schema({
    id: {type: String, required: true},
    type: {type: InvestmentTypeSchema, required: true},
    value: {type: Number, required: true},
    accountTaxStatus: {
        type: String,
        enum: Object.values(AccountTaxStatus),
        required: true,
    },
})

const Investment = mongoose.model('Investment', InvestmentSchema);

module.exports = {
    Investment,
    InvestmentSchema,
    AccountTaxStatus,
};