// Distribution Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Enum for distribution types
const DistributionTypes = Object.freeze({
    FIXED: "fixed",
    NORMAL: "normal",
    UNIFORM: "uniform",
});

// General distribution model with discriminator key
const DistributionSchema = new Schema({
    type: {
        type: String,
        enum: Object.values(DistributionTypes),
        required: true,
    },
}, { discriminatorKey: 'type' });

const Distribution = mongoose.model('Distribution', DistributionSchema);

// Fixed Distribution
const FixedDistribution = Distribution.discriminator(
    DistributionTypes.FIXED,
    new Schema({
        value: { type: Number, required: true }
    })
);

// Normal Distribution
const NormalDistribution = Distribution.discriminator(
    DistributionTypes.NORMAL,
    new Schema({
        mean: { type: Number, required: true },
        stdev: { type: Number, required: true, min: 0 }
    })
);

// Uniform Distribution
const UniformDistribution = Distribution.discriminator(
    DistributionTypes.UNIFORM,
    new Schema({
        lower: { type: Number, required: true },
        upper: {
            type: Number, required: true,
            validate: {
                validator: function (v) {
                    return v > this.lower;
                },
                message: 'Upper bound must be greater than lower bound'
            }
        }
    })
);

module.exports = {
    DistributionSchema,
    Distribution,
    FixedDistribution,
    NormalDistribution,
    UniformDistribution,
};