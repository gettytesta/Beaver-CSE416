// Investment Type Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DistributionSchema } = require('./distribution');

const InvestmentTypeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }, //required for consistency
  expectedAnnualReturn: { type: DistributionSchema, required: true },
  expenseRatio: { type: Number, required: true, min: 0 }, // safe to keep min: 0
  expectedAnnualIncome: { type: DistributionSchema, required: true },
  isTaxExempt: { type: Boolean, required: true }, // True = not taxed , false = taxed
});

module.exports = {
  InvestmentType: mongoose.model('InvestmentType', InvestmentTypeSchema),
  InvestmentTypeSchema,
};