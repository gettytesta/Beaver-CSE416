// Investment Type Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DistributionSchema } = require('./distribution');

const InvestmentTypeSchema = new Schema({
  name: { type: String, required: true }, //////////////////////////
  description: { type: String, required: true }, //required for consistency ////////////////////////
  //NEW: Specify whether return is in amount or percent
  returnAmtOrPct: {
    type: String,
    enum: ['amount', 'percent'],
    required: true,
  },

  //Already existing: return distribution (fixed, normal, uniform)
  expectedAnnualReturn: {
    type: DistributionSchema,
    required: true,
  },
  expenseRatio: { type: Number, required: true, min: 0 }, // safe to keep min: 0 /////////////////////
  //INCOME
  incomeAmtOrPct: {
    type: String,
    enum: ['amount', 'percent'],
    required: true,
  },
  expectedAnnualIncome: {
    type: DistributionSchema,
    required: true,
  },
  taxability: { type: Boolean, required: true }, //true = taxable, false = tax-exempt
});

module.exports = {
  InvestmentType: mongoose.model('InvestmentType', InvestmentTypeSchema),
  InvestmentTypeSchema,
};