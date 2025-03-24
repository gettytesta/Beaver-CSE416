// State Tax YAML File Document Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateTaxYamlSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    stateCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    content: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
StateTaxYamlSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('StateTaxYaml', StateTaxYamlSchema); 