// Event Series Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const { DistributionSchema } = require('./distribution');
const { AssetSchema } = require('./asset');

// GETTY - Idk if we need to make different models depending on the event series. For now, this is unfinished.
// ^ I made subclasses of EventSeries using a discriminator key

// TODO - startYear type should be changed to represent the types it can be (startwith or a distribution-- see scenario.yaml)
// not sure if a new model has to be made for this or smth

// Enum for event types
// MIGHT NEED TO BE MOVED, DEPENDING ON WHERE THIS IS NEEDED
const EventTypes = Object.freeze({
    INCOME: "income",
    EXPENSE: "expense",
    INVEST: "invest",
    REBALANCE: "rebalance",
});

var EventSeriesSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    startYear: {type: Number, required: true},
    duration: {type: DistributionSchema, required: true},
    type: {
        type: String,
        enum: Object.values(EventTypes),
        required: true,
    },
}, { discriminatorKey: 'type' });

const EventSeries = mongoose.model('EventSeries', EventSeriesSchema);

const IncomeEventSeries = EventSeries.discriminator(
    EventTypes.INCOME,
    new Schema({
        initialAmount: {type: Number, required: true},
        isPercentChange: {type: Boolean, required: true}, // false -> change represented as an amount, true -> change represented as percent
        changeDistribution: {type: DistributionSchema, required: true},
        isInflationAdjusted: {type: Boolean, required: true},
        userFraction: {type: Number, required: true},
        isSocialSecurity: {type: Boolean, required: true},
    })
);

const ExpenseEventSeries = EventSeries.discriminator(
    EventTypes.EXPENSE,
    new Schema({
        initialAmount: {type: Number, required: true},
        isPercentChange: {type: Boolean, required: true}, // false -> change represented as an amount, true -> change represented as percent
        changeDistribution: {type: DistributionSchema, required: true},
        isInflationAdjusted: {type: Boolean, required: true},
        userFraction: {type: Number, required: true},
        isDiscretionary: {type: Boolean, required: true},
    })
);

const InvestEventSeries = EventSeries.discriminator(
    EventTypes.INVEST,
    new Schema({
        assetAllocation: {type:[AssetSchema], required: true},
        isGlidePath: {type: Boolean, required: true},
        assetAllocation2: {type:[AssetSchema], required: true},
        maxCash: {type: Number, required: true},
    })
);

const RebalanceEventSeries = EventSeries.discriminator(
    EventTypes.REBALANCE,
    new Schema({
        assetAllocation: {type:[AssetSchema], required: true},
    })
);

module.exports = {
    EventTypes,
    EventSeries,
    IncomeEventSeries,
    ExpenseEventSeries,
    InvestEventSeries,
    RebalanceEventSeries,
};