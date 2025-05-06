const seedrandom = require('seedrandom');

let rng = Math.random;

exports.setSeed = (seed) => {
    rng = seedrandom(seed);
};

exports.generateNormalRandom = (mean, stdev) => {
    const u1 = rng();
    const u2 = rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdev + mean;
};

exports.sampleValueFromDistribution = (distObj) => {
    if (!distObj || !distObj.type) {
        return 0;
    }

    switch (distObj.type) {
        case 'fixed':
            return distObj.value;

        case 'normal':
            return exports.generateNormalRandom(distObj.mean, distObj.stdev);

        case 'uniform':
            return distObj.lower + rng() * (distObj.upper - distObj.lower);

        default:
            throw new Error(`Unknown distribution type: ${distObj.type}`);
    }
};

exports.adjustNumber = (num, inflationRate) => {
    return Math.round(num * (1 + inflationRate));
}

exports.adjustTaxBrackets = (taxBrackets, inflationRate) => {
    const adjustBracket = (bracket) => {
        return {
            lowerBound: exports.adjustNumber(bracket.lowerBound, inflationRate),
            upperBound: exports.adjustNumber(bracket.upperBound, inflationRate),
            rate: exports.adjustNumber(bracket.rate, inflationRate)
        };
    }

    // Check if taxBrackets is an array (direct incomeTaxBrackets or capitalGainsBrackets)
    if (Array.isArray(taxBrackets)) {
        return taxBrackets.map(adjustBracket);
    }

    // Otherwise, it's the full tax brackets object
    return {
        standardDeduction: exports.adjustNumber(taxBrackets.standardDeduction, inflationRate),
        incomeTaxBrackets: taxBrackets.incomeTaxBrackets.map(adjustBracket),
        capitalGainsBrackets: taxBrackets.capitalGainsBrackets.map(adjustBracket)
    };
}

exports.initializeInvestments = (investments) => {
    if (!investments) {
        return [];
    }

    return investments.map(investment => {
        // Initialize new variables for the sim to use
        investment.initialValue = investment.value; // init value, constant
        investment.purchasePrice = investment.value; // cost to purchase this investment, will be updated after each purchase
        return investment; // Return the modified investment object
    });
}

exports.initializeEvents = (eventSeriesSet) => {
    // Return empty array if eventSeriesSet is undefined or null
    if (!eventSeriesSet) {
        return [];
    }

    // Create a shallow copy of the array but keep original objects
    const eventsToProcess = [...eventSeriesSet].filter(
        eventSeries => eventSeries.type === 'income' ||
            eventSeries.type === 'expense' ||
            eventSeries.type === 'invest' ||
            eventSeries.type === 'rebalance'
    );

    // First pass: initialize event properties
    eventsToProcess.forEach(eventSeries => {
        const originalId = eventSeries._id; // Save original ID 
        if (!(eventSeries.start.type === 'startWith' || eventSeries.start.type === 'startAfter')) {
            // Sample and set start
            
            if (eventSeries.start.type === 'fixed' || eventSeries.start.type === 'uniform' || eventSeries.start.type === 'normal') {
                eventSeries.start = Math.round(exports.sampleValueFromDistribution(eventSeries.start));
            }
        }

        // Sample and set duration
        eventSeries.duration = Math.round(exports.sampleValueFromDistribution(eventSeries.duration));

        // "unpack" the values for this type by copying type-specific properties
        if (eventSeries.type === 'income' && eventSeries.income) {
            Object.keys(eventSeries.income).forEach(key => {
                if (key !== '_id') { // Avoid overwriting _id
                    eventSeries[key] = eventSeries.income[key];
                }
            });
            eventSeries.currAmount = eventSeries.initialAmount;
        } else if (eventSeries.type === 'expense' && eventSeries.expense) {
            Object.keys(eventSeries.expense).forEach(key => {
                if (key !== '_id') { // Avoid overwriting _id
                    eventSeries[key] = eventSeries.expense[key];
                }
            });
            eventSeries.currAmount = eventSeries.initialAmount;
        } else if (eventSeries.type === 'invest' && eventSeries.invest) {
            Object.keys(eventSeries.invest).forEach(key => {
                if (key !== '_id') { // Avoid overwriting _id
                    eventSeries[key] = eventSeries.invest[key];
                }
            });
        } else if (eventSeries.type === 'rebalance' && eventSeries.rebalance) {
            Object.keys(eventSeries.rebalance).forEach(key => {
                if (key !== '_id') { // Avoid overwriting _id
                    eventSeries[key] = eventSeries.rebalance[key];
                }
            });
        }

        // Make sure _id is preserved
        eventSeries._id = originalId;

    });

    // Second pass: handle startWith and startAfter events
    eventsToProcess.forEach(event => {
        if (event.start.type === 'startWith' || event.start.type === 'startAfter') {
            const referencedEvent = eventsToProcess.find(e => e.name === event.start.eventSeries);
            if (!referencedEvent) {
                throw new Error(`Referenced event ${event.start.eventSeries} not found for ${event.name}`);
            }

            // Use the calculated value instead of replacing the start object
            if (event.start.type === 'startWith') {
                event.start = referencedEvent.start;
            } else if (event.start.type === 'startAfter') {
                event.start = referencedEvent.start + 1;
            }
        }
    });

    return eventsToProcess;
};

exports.lookUpTaxBracket = (taxBrackets, value) => {
    // Find the bracket where the value falls within the lower and upper bounds
    for (const bracket of taxBrackets) {
        if (value >= bracket.lowerBound && value <= bracket.upperBound) {
            return bracket;
        }
    }

    // If no bracket is found (shouldn't happen with proper tax brackets that include Infinity)
    // Return the highest bracket as a fallback
    return taxBrackets[taxBrackets.length - 1];
}

exports.calculateTaxFromBrackets = (value, taxBrackets) => {
    if (!value || value <= 0 || !taxBrackets || !Array.isArray(taxBrackets) || taxBrackets.length === 0) {
        return 0;
    }

    let totalTax = 0;
    let remainingValue = value;

    for (const bracket of taxBrackets) {
        if (remainingValue <= 0) break;

        let taxableInThisBracket = Math.min(
            remainingValue,
            bracket.upperBound - bracket.lowerBound + 1
        );

        totalTax += taxableInThisBracket * bracket.rate;
        remainingValue -= taxableInThisBracket;
    }

    return totalTax;
}

exports.getBoundsAndDelta = (selectedParameter) => {
    let lowerBound;
    let upperBound;
    let delta;

    if (selectedParameter.subParameter === 'rothOptimizer') {
        lowerBound = selectedParameter.rothStart;
        upperBound = selectedParameter.rothEnd;
        delta = 1; // 1 year
    } else if (
        selectedParameter.subParameter === 'startYearDuration' ||
        selectedParameter.subParameter === 'incomeExpenseInitial' ||
        selectedParameter.subParameter === 'investmentPercentage'
    ) {
        lowerBound = selectedParameter.range.lower;
        upperBound = selectedParameter.range.upper;
        delta = selectedParameter.range.step;
    }

    return { lowerBound, upperBound, delta };
}

