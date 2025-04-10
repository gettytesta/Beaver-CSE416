const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RMDTableSchema = new Schema({
    year: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    distributionPeriods: {
        type: Map,
        of: Number,
        required: true,
        // The key is age (number), value is distribution period (number) in years
    }
});

module.exports = mongoose.model('RMDTable', RMDTableSchema); 