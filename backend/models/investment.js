// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { InvestmentTypeSchema } = require('./investmentType');


const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "nonretirement", ////////CHANGE THIS LATER
    PRE_TAX_RETIREMENT: "pretaxretirement", /////////THIS
    POST_TAX_RETIREMENT: "posttaxretirement", //////THIS
});

var InvestmentSchema = new Schema({
    _id: {type: String, required: true}, //THIS
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