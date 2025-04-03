const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Define the enum
const DistributionTypes = Object.freeze({
  FIXED: "fixed",
  NORMAL: "normal",
  UNIFORM: "uniform",
});

//Embedded Distribution Schema
const DistributionSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(DistributionTypes),
    required: true,
  },
  value: {
    type: Number,
    required: function () {
      return this.type === 'fixed';
    },
  },
  mean: {
    type: Number,
    required: function () {
      return this.type === 'normal';
    },
  },
  stdev: {
    type: Number,
    min: 0,
    required: function () {
      return this.type === 'normal';
    },
  },
  lower: {
    type: Number,
    required: function () {
      return this.type === 'uniform';
    },
  },
  upper: {
    type: Number,
    required: function () {
      return this.type === 'uniform';
    },
    validate: {
      validator: function (v) {
        return this.type !== 'uniform' || v > this.lower;
      },
      message: 'Upper must be greater than lower.',
    },
  },
});

module.exports = {
  DistributionSchema,
};
