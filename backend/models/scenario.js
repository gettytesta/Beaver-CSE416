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
    userLifeExpectancy: { type: DistributionSchema, required: true }, 
    spouseLifeExpectancy: { type: DistributionSchema, required: function () { return this.isMarriedCouple;} }, 
    //investments
    investments: { type: [InvestmentSchema], default: [] }, 
    //eventSeries
    eventSeriesSet: { type: [EventSeriesSchema], default: [] },

    spendingStrategy: {
        type: [String], //Just store the _id (UUID string) of the selected event series
        default: [],
    },


    //Expense Strategy
    expenseWithdrawalStrategy: {
        type: [String], //  if using UUIDs
        default: [],
    },

    //inflation assumption this is required 
    inflationAssumption: { type: DistributionSchema, required: false }, 

    // Retire contribution limits (TODO add input in frontend)
    userRetireContributionLimit: { type: Number, required: true },

    //roth conversion strategy 
    rothConversionOpt: { type: Boolean, default: false },
    rothConversionStart: { type: Number },
    rothConversionEnd: { type: Number },
    rothConversionStrategy: { type: [String], default: [] }, // UUIDs instead of ObjectIds


    //not in frontend (not needed)
    afterTaxContributionLimit: { type: Number, required: false }, 
    
    rmdStrategy: { type: [String], default: [] }, // UUID strings of selected investments

    financialGoal: { type: Number, required: true }, 
    
    userStateOfResidence: {
        type: String, required: true,
        validate: {
            validator: validateStateCode,
            message: 'Invalid US state abbreviation'
        }
    },
    //State Tax available yes or no 
    stateTaxStatus: {
        type: String,
        enum: ["used", "ignored", "none"],
        required: true,
        default: "none",
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