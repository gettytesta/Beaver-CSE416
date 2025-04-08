const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    initialAmount: { type: Number, required: true }, // 1. Initial $
  
    changeAmtOrPct: { // 2. Amount vs Percentage
      type: String,
      enum: ['amount', 'percent'],
      required: true,
    },
  
    changeDistribution: { // 2. Fixed, Uniform, or Normal
      type: new Schema({
        type: {
          type: String,
          enum: ['fixed', 'uniform', 'normal'],
          required: true,
        },
        value: { type: Number }, // for fixed
        mean: { type: Number },  // for normal
        stdev: { type: Number }, // for normal
        lower: { type: Number }, // for uniform
        upper: {
          type: Number,
          validate: {
            validator: function (v) {
              return this.type !== 'uniform' || v > this.lower;
            },
            message: 'Upper must be greater than lower',
          },
        },
      }),
      required: true
    },
  
    adjustForInflation: { type: Boolean, required: true }, // 3. Inflation
  
    userPct: { type: Number, min: 0, max: 100 }, // 4. % for user (optional if not married)
  
    isSocialSecurity: { type: Boolean, required: true }, // 5. Social Security flag
  });


  const ExpenseSchema = new Schema({
    initialAmount: { type: Number, required: true },
  
    changeAmtOrPct: {
      type: String,
      enum: ["amount", "percent"],
      required: true,
    },
  
    changeDistribution: {
      type: new Schema({
        type: {
          type: String,
          enum: ["fixed", "normal", "uniform"],
          required: true,
        },
        value: {
          type: Number,
          required: function () {
            return this.type === "fixed";
          },
        },
        mean: {
          type: Number,
          required: function () {
            return this.type === "normal";
          },
        },
        stdev: {
          type: Number,
          min: 0,
          required: function () {
            return this.type === "normal";
          },
        },
        lower: {
          type: Number,
          required: function () {
            return this.type === "uniform";
          },
        },
        upper: {
          type: Number,
          required: function () {
            return this.type === "uniform";
          },
          validate: {
            validator: function (v) {
              return this.type !== "uniform" || v > this.lower;
            },
            message: "Upper must be greater than lower.",
          },
        },
      }),
      required: true,
    },
  
    adjustForInflation: { type: Boolean, required: true },
    userPct: { type: Number, required: true }, // used if isMarried
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
            max: 100,
          },
          initial: {
            type: Number,
            min: 0,
            max: 100,
          },
          final: {
            type: Number,
            min: 0,
            max: 100,
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
  
          return Math.round(total) === 100;
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
            max: 100,
          },
          initial: {
            type: Number,
            min: 0,
            max: 100,
          },
          final: {
            type: Number,
            min: 0,
            max: 100,
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
  
          return Math.round(total) === 100;
        },
        message:
          'Total allocation must sum to 100%. For glide, both initial and final totals should equal 100%.',
      },
    },
  });

  const EventSeriesSchema = new Schema({
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
      type: new Schema({
        type: {
          type: String,
          enum: ['fixed', 'uniform', 'normal'],
          required: true,
        },
        value: { type: Number },         // fixed
        mean: { type: Number },          // normal
        stdev: { type: Number, min: 0 }, // normal
        lower: { type: Number },         // uniform
        upper: {
          type: Number,
          validate: {
            validator: function (v) {
              return this.type !== 'uniform' || v > this.lower;
            },
            message: 'Upper must be greater than lower',
          },
        },
      }, { _id: false }),
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
  

module.exports = {
    EventSeriesSchema,
    IncomeSchema,
    ExpenseSchema,
    InvestSchema,
    RebalanceSchema,
  };