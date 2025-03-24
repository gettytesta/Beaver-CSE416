// User Document Schema

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
    googleId: {
      type: String,
      required: true,
      unique: true
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

    // All yaml files are stored in root/backend/yamls. 
    // we track a user's yamls by generating a random 
    // string id when they upload one then put id.yaml 
    // in yamls and store id in this list.
    // few notes:
    // - Only save the yaml to the yamls folder if a user 
    //   is uploading a yaml containing state tax data. 
    //   if theyre importing a scenario we convert the yaml 
    //   into a scenario and save the scenario to the database.
    // - only allow up to a certain amount of yaml files to be uploaded
    // - users should be allowed to remove yaml files they've uploaded.
    YAMLFiles: { type: [String], default: [] },
  });

module.exports = mongoose.model('User', UserSchema)