/**
 * Generates a random value from a normal distribution
 * @param {number} mean - The mean of the distribution
 * @param {number} stdev - The standard deviation of the distribution
 * @returns {number} A random value from the distribution
 */
function generateNormalRandom(mean, stdev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdev + mean;
}

/**
 * Samples a value from a distribution object
 * @param {Object} distObj - The distribution object
 * @param {string} distObj.type - The type of distribution ('fixed', 'normal', 'uniform')
 * @returns {number} A sampled value from the distribution
 */
function sampleValueFromDistribution(distObj) {
    if (!distObj || !distObj.type) {
        return 0; // Avoid throwing errors.
    }

    switch (distObj.type) {
        case 'fixed':
            return distObj.value;

        case 'normal':
            return generateNormalRandom(distObj.mean, distObj.stdev);

        case 'uniform':
            return distObj.lower + Math.random() * (distObj.upper - distObj.lower);

        default:
            throw new Error(`Unknown distribution type: ${distObj.type}`);
    }
}

function adjustNumber (num, inflationRate) {
    return Math.round(num * (1 + inflationRate));
}

function adjustTaxBrackets (taxBrackets, inflationRate) {
    function adjustBracket(bracket) {
        return {
            lowerBound: adjustNumber(bracket.lowerBound), 
            upperBound: adjustNumber(bracket.upperBound),
            rate: adjustNumber(bracket.rate)
        };
    }

    return {
        standardDeduction: adjustNumber(taxBrackets.standardDeduction),
        incomeTaxBrackets: taxBrackets.incomeTaxBrackets.map(adjustBracket),
        capitalGainsBrackets: taxBrackets.capitalGainsBrackets.map(adjustBracket)
    };
}

function initializeEvents (eventSeriesSet) {
    return eventSeriesSet
    .filter(eventSeries => eventSeries.type === 'income' || eventSeries.type === 'expense' || eventSeries.type === 'invest' || eventSeries.type === 'rebalance')
    .map(eventSeries => {
      // Sample and set start and duration
      eventSeries.start = sampleValueFromDistribution(eventSeries.start);
      eventSeries.duration = sampleValueFromDistribution(eventSeries.duration);

      // "unpack" the values for this type by spreading type-specific properties to the root level
      if (eventSeries.type === 'income' && eventSeries.income) {
        Object.assign(eventSeries, eventSeries.income);

        // Initialize any new variables for this income event
        eventSeries.currAmount = eventSeries.initialAmount;

        delete eventSeries.income;
      } else if (eventSeries.type === 'expense' && eventSeries.expense) {
        Object.assign(eventSeries, eventSeries.expense);
        delete eventSeries.expense;
      } else if (eventSeries.type === 'invest' && eventSeries.invest) {
        Object.assign(eventSeries, eventSeries.invest);
        delete eventSeries.invest;
      } else if (eventSeries.type === 'rebalance' && eventSeries.rebalance) {
        Object.assign(eventSeries, eventSeries.rebalance);
        delete eventSeries.rebalance;
      }

      return eventSeries;
    });
}

function calculateRMD(rmdTable, iraAccountBalance, age) {
    const distributionPeriodNumber = rmdTable[age];
    return iraAccountBalance / distributionPeriodNumber;
}

// Helper function to calculate income (simplified)
function calculateIncome(incomeEvent, yearIndex, inflationRate) {
    const baseAmount = incomeEvent.initialAmount;
    
    // Apply inflation adjustment if needed
    if (incomeEvent.isInflationAdjusted) {
        baseAmount *= Math.pow(1 + inflationRate, yearIndex);
    }

    // Apply change (either percent or absolute)
    const changeValue = incomeEvent.isPercentChange 
        ? baseAmount * sampleValueFromDistribution(incomeEvent.changeDistribution)
        : sampleValueFromDistribution(incomeEvent.changeDistribution);

    return baseAmount + changeValue;
}

// Helper function to calculate expenses (simplified)
function calculateExpense(expenseEvent, yearIndex, inflationRate) {
    const baseAmount = expenseEvent.initialAmount;
    
    // Apply inflation adjustment if needed
    if (expenseEvent.isInflationAdjusted) {
        baseAmount *= Math.pow(1 + inflationRate, yearIndex);
    }

    // Apply change (either percent or absolute)
    const changeValue = expenseEvent.isPercentChange 
        ? baseAmount * sampleValueFromDistribution(expenseEvent.changeDistribution)
        : sampleValueFromDistribution(expenseEvent.changeDistribution);

    return baseAmount + changeValue;
}

module.exports = {
    sampleValueFromDistribution,
    calculateRMD,
    calculateIncome,
    calculateExpense
}