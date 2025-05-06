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
            return exports.generateNormalRandom(distObj.mean, distObj.stdev);

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

    // First pass: initialize all events with fixed start times
    const events = eventSeriesSet
        .filter(eventSeries => eventSeries.type === 'income' || eventSeries.type === 'expense' || eventSeries.type === 'invest' || eventSeries.type === 'rebalance')
        .map(eventSeries => {
            // Sample and set start and duration
            if (eventSeries.start.type === 'fixed' || eventSeries.start.type === 'uniform' || eventSeries.start.type === 'normal') {
                eventSeries.start = exports.sampleValueFromDistribution(eventSeries.start);
            }
            eventSeries.duration = exports.sampleValueFromDistribution(eventSeries.duration);

            // "unpack" the values for this type by spreading type-specific properties to the root level
            if (eventSeries.type === 'income' && eventSeries.income) {
                Object.assign(eventSeries, eventSeries.income);
                eventSeries.currAmount = eventSeries.initialAmount;
                delete eventSeries.income;
            } else if (eventSeries.type === 'expense' && eventSeries.expense) {
                Object.assign(eventSeries, eventSeries.expense);
                eventSeries.currAmount = eventSeries.initialAmount;
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

    // Second pass: handle startWith and startAfter events
    events.forEach(event => {
        if (event.start.type === 'startWith' || event.start.type === 'startAfter') {
            const referencedEvent = events.find(e => e.name === event.start.eventSeries);
            if (!referencedEvent) {
                throw new Error(`Referenced event ${event.start.eventSeries} not found for ${event.name}`);
            }
            
            // Set start time based on referenced event
            if (event.start.type === 'startWith') {
                event.start = referencedEvent.start;
            } else if (event.start.type === 'startAfter') {
                event.start = referencedEvent.start + 1;
            }
        }
    });

    return events;
}

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
