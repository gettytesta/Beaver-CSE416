// Investment Type Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { DistributionSchema } = require('./distribution');

var InvestmentTypeSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    expectedAnnualReturn: {type: DistributionSchema, required: true},
    expenseRatio: {type: Number, required: true},
    expectedAnnualIncome: {type: DistributionSchema, required: true},
    isTaxed: {type: Boolean, required: true},
})

module.exports = mongoose.model('InvestmentType', InvestmentTypeSchema)