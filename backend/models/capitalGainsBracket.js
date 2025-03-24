// Capital gains bracket Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

exports.CapitalGainsBracketSchema = new Schema({
    lowerBound: {
        type: Number,
        required: true
    },
    upperBound: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    }
});
