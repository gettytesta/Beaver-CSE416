// Scenario Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { DistributionSchema } = require('./distribution');
const { validateStateCode } = require('./utils/validateUtils');

var ScenarioSchema = new Schema({
    name: { type: String, required: true },
    // OwnerID
    // SharedToIDs
    isMarriedCouple: { type: Boolean, required: true },
    userBirthYear: { type: Number, required: true },
    spouseBirthYear: { type: Number, required: true },
    userLifeExpectancy: { type: DistributionSchema, required: true },
    spouseLifeExpectancy: { type: DistributionSchema, required: true },
    investments: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },
    eventSeriesSet: { type: [Schema.Types.ObjectId], ref: 'EventSeries', default: [] },
    inflationAssumption: { type: DistributionSchema, required: true },
    initialLimit: { type: Number, required: true },
    // spendingStrategy
    expenseWithdrawlStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },
    rmdStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },
    rothConversionStrategy: { type: [Schema.Types.ObjectId], ref: 'Investment', default: [] },
    // rcoSettings
    financialGoal: { type: Number, required: true },
    userStateOfResidence: {
        type: String, required: true,
        validate: {
            validator: validateStateCode,
            message: 'Invalid US state abbreviation'
        }
    },
})

module.exports = mongoose.model('Scenario', ScenarioSchema)