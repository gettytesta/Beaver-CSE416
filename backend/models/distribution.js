const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Define the enum
const DistributionTypes = Object.freeze({
  FIXED: "fixed",
  NORMAL: "normal",
  UNIFORM: "uniform",
  GBM: "GBM",
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
      return this.type === DistributionTypes.FIXED;
    },
  },
  mean: {
    type: Number,
    required: function () {
      return this.type === DistributionTypes.NORMAL;
    },
  },
  stdev: {
    type: Number,
    min: 0,
    required: function () {
      return this.type === DistributionTypes.NORMAL;
    },
  },
  lower: {
    type: Number,
    required: function () {
      return this.type === DistributionTypes.UNIFORM;
    },
  },
  upper: {
    type: Number,
    required: function () {
      return this.type === DistributionTypes.UNIFORM;
    },
    validate: {
      validator: function (v) {
        return this.type !== DistributionTypes.UNIFORM || v > this.lower;
      },
      message: 'Upper must be greater than lower.',
    },
  },
  mu: {
    type: Number,
    required: () => this.type === DistributionTypes.GBM,
  },
  sigma: {
    type: Number,
    required: () => this.type === DistributionTypes.GBM,
  },
});

module.exports = {
  DistributionSchema,
  DistributionTypes,
};
