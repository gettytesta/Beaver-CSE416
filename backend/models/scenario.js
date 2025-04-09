// Scenario Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { DistributionSchema } = require('./distribution');
const { validateStateCode } = require('../utils/validateUtils');
const { SharedUserSchema } = require('./sharedUser');
const { InvestmentSchema } = require('./investment');
const { EventSeriesSchema } = require('./eventseries');

var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [SharedUserSchema],
    isMarriedCouple: { type: Boolean, required: true },
    userBirthYear: { type: Number, required: true },
    spouseBirthYear: { type: Number, required: function () { return this.isMarriedCouple;} },
    userRetirementAge: { type: Number, required: true },
    spouseRetirementAge: { type: Number, required: function () { return this.isMarriedCouple; } },
    userLifeExpectancy: { type: DistributionSchema, required: true },
    spouseLifeExpectancy: { type: DistributionSchema, required: function () { return this.isMarriedCouple;} },
    //investments
    investments: { type: [InvestmentSchema], default: [] },
    //eventSeries 
    eventSeriesSet: { type: [EventSeriesSchema], default: [] },        //each scenario has its OWN eventSeries

    //Spending Strategy
    spendingStrategy: {
        type: [Schema.Types.ObjectId], //references to EventSeries (not just names)
        ref: 'EventSeries', // reference to the EventSeries model
        default: [],
    },

    //Expense Strategy
    expenseWithdrawlStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },

    //inflation assumption
    inflationAssumption: { type: DistributionSchema, required: true },

    //roth conversion strategy 
    rothConversionOpt: { type: Boolean, default: false },
    rothConversionStart: { type: Number },
    rothConversionEnd: { type: Number },
    rothConversionStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },

    //not in frontend (not needed)
    afterTaxContributionLimit: { type: Number, required: true },
    
    rmdStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },

    financialGoal: { type: Number, required: true },
    userStateOfResidence: {
        type: String, required: true,
        validate: {
            validator: validateStateCode,
            message: 'Invalid US state abbreviation'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field on save
ScenarioSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = {
    Scenario: mongoose.model('Scenario', ScenarioSchema)
}