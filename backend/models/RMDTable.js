const mongoose = require('mongoose');

const RMDTableSchema = new mongoose.Schema({
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

// Update the updatedAt timestamp before saving
RMDTableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const RMDTable = mongoose.model('RMDTable', RMDTableSchema);

module.exports = RMDTable; 