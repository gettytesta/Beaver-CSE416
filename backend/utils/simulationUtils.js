
exports.generateNormalRandom = (mean, stdev) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdev + mean;
}

exports.sampleValueFromDistribution = (distObj) => {
    if (!distObj || !distObj.type) {
        return 0; // Avoid throwing errors.
    }

    switch (distObj.type) {
        case 'fixed':
            return distObj.value;

        case 'normal':
            return this.generateNormalRandom(distObj.mean, distObj.stdev);

        case 'uniform':
            return distObj.lower + Math.random() * (distObj.upper - distObj.lower);

        default:
            throw new Error(`Unknown distribution type: ${distObj.type}`);
    }
}

exports.adjustNumber = (num, inflationRate) => {
    return Math.round(num * (1 + inflationRate));
}

exports.adjustTaxBrackets = (taxBrackets, inflationRate) => {
    function adjustBracket(bracket) {
        return {
            lowerBound: this.adjustNumber(bracket.lowerBound, inflationRate), 
            upperBound: this.adjustNumber(bracket.upperBound, inflationRate),
            rate: this.adjustNumber(bracket.rate, inflationRate)
        };
    }

    return {
        standardDeduction: this.adjustNumber(taxBrackets.standardDeduction, inflationRate),
        incomeTaxBrackets: taxBrackets.incomeTaxBrackets.map(adjustBracket),
        capitalGainsBrackets: taxBrackets.capitalGainsBrackets.map(adjustBracket)
    };
}

exports.initializeEvents = (eventSeriesSet) => {
    return eventSeriesSet
    .filter(eventSeries => eventSeries.type === 'income' || eventSeries.type === 'expense' || eventSeries.type === 'invest' || eventSeries.type === 'rebalance')
    .map(eventSeries => {
      // Sample and set start and duration
      eventSeries.start = this.sampleValueFromDistribution(eventSeries.start);
      eventSeries.duration = this.sampleValueFromDistribution(eventSeries.duration);

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
