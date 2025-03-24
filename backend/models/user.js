// User Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
    googleId: {
      type: String,
      required: true,
      unique: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: true
    },
    profilePicture: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
  }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

// Virtual field for YAML files
UserSchema.virtual('yamlFiles', {
  ref: 'YamlFile',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.model('User', UserSchema)