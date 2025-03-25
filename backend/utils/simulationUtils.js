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