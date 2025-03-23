// Scenario Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ScenarioSchema = new Schema({
    name: {type: String, required: true},
    // OwnerID
    // SharedToIDs
    isMarriedCouple: {type: Boolean, required: true},
    userBirthYear: {type: Number, required: true},
    spouseBirthYear: {type: Number, required: true},
    userLifeExpectancy: {type: Number, required: true},
    spouseLifeExpectancy: {type: Number, required: true},
    investments: {type:[Schema.Types.ObjectId], ref: 'Investment', default: []},
    eventSeriesSet: {type:[Schema.Types.ObjectId], ref: 'EventSeries', default: []},
    inflationAssumption: {type: Number, required: true},
    initialLimit: {type: Number, required: true},
    // spendingStrategy
    expenseWithdrawlStrategy: {type:[Schema.Types.ObjectId], ref: 'Investment', default: []},
    rmdStrategy: {type:[Schema.Types.ObjectId], ref: 'Investment', default: []},
    rothConversionStrategy: {type:[Schema.Types.ObjectId], ref: 'Investment', default: []},
    // rcoSettings
    financialGoal: {type: Number, required: true},
    userStateOfResidence: {type: String, required: true},
})

module.exports = mongoose.model('Scenario', ScenarioSchema)