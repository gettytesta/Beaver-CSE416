// Asset Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

// not sure if this should exist or be renamed or moved into eventseries.js

// Essentially just an investment that has a percentage associated with it [0, 1] (ex 0.5)
// used for asset allocations
var AssetSchema = new Schema({
    investment: {type: Schema.Types.ObjectId, ref: 'Investment'},
    percentage: {type: Number, required: true}
});

const Asset = mongoose.model('Asset', AssetSchema);

module.exports = {
    AssetSchema,
    Asset
};