// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { InvestmentTypeSchema } = require('./investmentType');


const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "nonretirement",
    PRE_TAX_RETIREMENT: "pretaxretirement",
    POST_TAX_RETIREMENT: "posttaxretirement",
});

const InvestmentSchema = new Schema({
    _id: {type: String, required: true},
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