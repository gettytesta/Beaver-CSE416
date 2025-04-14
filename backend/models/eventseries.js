const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { DistributionSchema } = require('./distribution');

const EventStartSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['fixed', 'uniform', 'normal', 'startWith', 'startAfter'],
  },
  // For 'fixed'
  value: { type: Number },

  // For 'uniform'
  lower: { type: Number },
  upper: {
    type: Number,
    validate: {
      validator: function (v) {
        return this.type !== 'uniform' || v > this.lower;
      },
      message: 'Upper must be greater than lower',
    },
  },

  // For 'normal'
  mean: { type: Number },
  stdev: { type: Number, min: 0 },

  // For startWith / startAfter (reference another event series by name)
  eventSeries: { type: String },
});


  //NEED TO ADD VALIDATORS
  const IncomeSchema = new Schema({
    initialAmount: { type: Number, required: true },
  
    changeAmtOrPct: {
      type: String,
      enum: ['amount', 'percent'],
      required: true,
    },
  
    changeDistribution: {
      type: DistributionSchema,
      required: true,
    },
  
    adjustForInflation: { type: Boolean, required: true },
  
    userPct: { type: Number, min: 0, max: 100 }, // ❌ remove required: true
  
    isSocialSecurity: { type: Boolean, required: true },
  });


  const ExpenseSchema = new Schema({
    initialAmount: { type: Number, required: true },
  
    changeAmtOrPct: {
      type: String,
      enum: ["amount", "percent"],
      required: true,
    },
  
    changeDistribution: {
      type: DistributionSchema,
      required: true,
    },
  
    adjustForInflation: { type: Boolean, required: true },
  
    userPct: { type: Number, min: 0, max: 100 }, // ❌ remove required: true
  
    discretionary: { type: Boolean, required: true },
  });


  const InvestSchema = new Schema({
    allocationType: {
      type: String,
      enum: ['fixed', 'glide'],
      default: 'fixed',
      required: true,
    },
  
    selectedInvestments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Investment',
        required: true,
      },
    ],
  
    allocations: {
      type: Map,
      of: new Schema(
        {
          value: {
            type: Number,
            min: 0,
            max: 1,
          },
          initial: {
            type: Number,
            min: 0,
            max: 1,
          },
          final: {
            type: Number,
            min: 0,
            max: 1,
          },
        },
        { _id: false }
      ),
      required: true,
      validate: {
        validator: function (allocations) {
          const isGlide = this.allocationType === 'glide';
  
          const total = Array.from(allocations.values()).reduce((sum, obj) => {
            if (isGlide) {
              return sum + ((obj.initial || 0) + (obj.final || 0)) / 2;
            }
            return sum + (obj.value || 0);
          }, 0);
  
          return Math.round(total) === 1;
        },
        message:
          'Total allocation must sum to 100%. For glide, both initial and final totals should equal 100%.',
      },
    },
  
    // maxCash addition
    maxCash: {
      type: Number,
      min: 0,
      default: 0,
      required: true,
    },
  });

  const RebalanceSchema = new Schema({
    allocationType: {
      type: String,
      enum: ['fixed', 'glide'],
      default: 'fixed',
      required: true,
    },
  
    selectedInvestments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Investment',
        required: true,
      },
    ],
  
    allocations: {
      type: Map,
      of: new Schema(
        {
          value: {
            type: Number,
            min: 0,
            max: 1,
          },
          initial: {
            type: Number,
            min: 0,
            max: 1,
          },
          final: {
            type: Number,
            min: 0,
            max: 1,
          },
        },
        { _id: false }
      ),
      required: true,
      validate: {
        validator: function (allocations) {
          const isGlide = this.allocationType === 'glide';
  
          const total = Array.from(allocations.values()).reduce((sum, obj) => {
            if (isGlide) {
              return sum + ((obj.initial || 0) + (obj.final || 0)) / 2;
            }
            return sum + (obj.value || 0);
          }, 0);
  
          return Math.round(total) === 1;
        },
        message:
          'Total allocation must sum to 100%. For glide, both initial and final totals should equal 100%.',
      },
    },
  });

  const EventSeriesSchema = new Schema({
    _id: {
      type: String,         // <- Use String to support UUIDs
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  
    description: {
      type: String,
      default: "", // Optional
    },
  
    start: {
      type: EventStartSchema,
      required: true,
    },
  
    duration: {
      type: DistributionSchema,
      required: true,
    },
  
    type: {
      type: String,
      enum: ['income', 'expense', 'invest', 'rebalance'],
      required: true,
    },
  
    income: {
      type: IncomeSchema,
      required: function () {
        return this.type === 'income';
      },
    },
  
    expense: {
      type: ExpenseSchema,
      required: function () {
        return this.type === 'expense';
      },
    },
  
    invest: {
      type: InvestSchema,
      required: function () {
        return this.type === 'invest';
      },
    },
  
    rebalance: {
      type: RebalanceSchema,
      required: function () {
        return this.type === 'rebalance';
      },
    },
  });

  const EventSeries = mongoose.model('EventSeries', EventSeriesSchema);
  

module.exports = {
    EventSeries,
    EventSeriesSchema,
    IncomeSchema,
    ExpenseSchema,
    InvestSchema,
    RebalanceSchema,
  };