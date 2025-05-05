// Investment Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { v4: uuidv4, } = require('uuid');

const { InvestmentTypeSchema } = require('./investmentType');


const AccountTaxStatus = Object.freeze({
    NON_RETIREMENT: "non-retirement", ////////CHANGE THIS LATER
    PRE_TAX_RETIREMENT: "pre-tax", /////////THIS
    POST_TAX_RETIREMENT: "after-tax", //////THIS
});

var InvestmentSchema = new Schema({
    _id: {type: String, required: true, default: uuidv4, }, //THIS
    //id: {type: String, required: true,},
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