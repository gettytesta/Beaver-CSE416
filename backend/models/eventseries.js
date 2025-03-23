// Event Series Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

// GETTY - Idk if we need to make different models depending on the event series. For now, this is unfinished.
// TODO - Get the rest of the event series covered

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
    duration: {type: Number, required: true},
    type: {
        type: String,
        enum: Object.values(EventTypes),
        required: true,
    },
})

module.exports = mongoose.model('EventSeries', EventSeriesSchema)