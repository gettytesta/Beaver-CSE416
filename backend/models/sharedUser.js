// Shared User Document Schema

var mongoose = require('mongoose')
var Schema = mongoose.Schema

const AccessLevels = Object.freeze({
    READ_ONLY: 'read_only',
    READ_WRITE: 'read_write'
});

const SharedUserSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    accessLevel: { 
        type: String, 
        enum: Object.values(AccessLevels),
        required: true 
    }
});

module.exports = {
    SharedUserSchema,
    AccessLevels
};