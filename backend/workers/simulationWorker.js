const { parentPort, workerData } = require('worker_threads');
const SimulationUtils = require('../utils/simulationUtils');
const crypto = require('crypto');

/**
 * Runs a single simulation with the provided tax data
 * @param {Object} scenario - The scenario to simulate
 * @param {string} simulationId - The ID of the simulation
 * @param {Object} federalTax - The federal tax data
 * @param {Object|null} stateTax - The state tax data (if applicable)
 * @param {Object} rmdTable - The RMD table
 * @returns {Object} The simulation result
 */
async function runSingleSimulation(scenario, simulationId, federalTax, stateTax, rmdTable) {
    try {
        // ====================
        // SIMULATION CONSTANTS
        // ====================

        const startYear = new Date().getFullYear();
        const userLifeExpectancy = SimulationUtils.sampleValueFromDistribution(scenario.userLifeExpectancy);
        const userDeathYear = scenario.userBirthYear + userLifeExpectancy;
        const spouseLifeExpectancy = SimulationUtils.sampleValueFromDistribution(scenario.spouseLifeExpectancy);
        const spouseDeathYear = scenario.spouseBirthYear + spouseLifeExpectancy;
        const endYear = userDeathYear;
        
        // ====================
        // SIMULATION VARIABLES
        // ====================

        // Keep track of which year it is in the simulation.
        let curYear = startYear;

        // Store financial metrics for each year of the simulation
        const simulationYearlyData = [];

        // Inflation rate
        let curInflationRate;

        // Save tax brackets, they are inflation adjusted every year.
        // System assumes filing status is Married filing jointly if the scenario is of a married couple, otherwise single.
        let curFederalTaxBrackets = scenario.isMarriedCouple ? federalTax.marriedFilingJointly : federalTax.single;
        let curStateTaxBrackets;
        if (stateTax != null) {
            curStateTaxBrackets = scenario.isMarriedCouple ? stateTax.marriedFilingJointly : stateTax.single;
        }
        let prevYearFederalTaxBrackets = curFederalTaxBrackets;
        let prevYearStateTaxBrackets = curStateTaxBrackets;

        // Save annual limits on retirement account contributions, they are inflation adjusted every year.
        let curUserRetireContributionLimit = scenario.userRetireContributionLimit;
        let curSpouseRetireContributionLimit = scenario.spouseRetireContributionLimit;

        // Save active events
        const allEvents = SimulationUtils.initializeEvents (scenario.eventSeriesSet);
        let incomeEvents = allEvents.filter(event => event.type === 'income');
        let expenseEvents = allEvents.filter(event => event.type === 'expense');
        let investEvents = allEvents.filter(event => event.type === 'invest');
        let rebalanceEvents = allEvents.filter(event => event.type === 'rebalance');

        // Initialize investments so that each one has a initial value and purchase price field
        scenario.investments = SimulationUtils.initializeInvestments(scenario.investments);

        // Helper functions
        const isUserDead = () => curYear >= userDeathYear;
        const isSpouseDead = () => curYear >= spouseDeathYear;
        const getUserAge = () => curYear - scenario.userBirthYear;
        const getSpouseAge = () => curYear - scenario.spouseBirthYear;
        const shouldRunEvent = (event) => curYear >= event.start && curYear <= event.start + event.duration;
        const getTotalAssets = () => {
            let s = cashInvestment.value;
            scenario.investments.forEach(inv => { s += inv.value; });
            return s;
        };
        const getInvestmentType = (id) => {
            return scenario.investmentTypes.find(type => type.name === id);
        };
        const getInvestment = (id) => {
            return scenario.investments.find(inv => inv._id === id);
        };

        // Cash investment
        let cashInvestment = scenario.investments.find(investment => getInvestmentType(investment.type).name === 'cash');

        // If no cash investment is found throw error.
        if (!cashInvestment) {
            throw Error("No cash investment found!");
        }

        // ====================
        // MAIN SIMULATION LOOP
        // ====================

        while (curYear < endYear) {

            // ================
            // 1. Preliminaries
            // ================

            // 1.a. If the inflation assumption uses a probability distribution, sample from that distribution and store
            // the result as the current year&#39;s inflation rate, for use in all inflation-related calculations for the year.
            curInflationRate = SimulationUtils.sampleValueFromDistribution(scenario.inflationAssumption);

            // 1.b. Compute and store inflation-adjusted tax brackets for the current year. This needs to be done by
            // saving the tax brackets each year, and updating the previous year’s tax brackets using the current
            // year’s inflation rate.
            curFederalTaxBrackets = SimulationUtils.adjustTaxBrackets(curFederalTaxBrackets, curInflationRate);
            if (curStateTaxBrackets) {
                curStateTaxBrackets = SimulationUtils.adjustTaxBrackets(curStateTaxBrackets, curInflationRate);
            }

            // 1.c. Compute and store the inflation-adjusted annual limits on retirement account contributions, in a
            // similar way.
            curUserRetireContributionLimit = SimulationUtils.adjustNumber(curUserRetireContributionLimit, curInflationRate);
            curSpouseRetireContributionLimit = SimulationUtils.adjustNumber(curSpouseRetireContributionLimit, curInflationRate);

            // ===============================================================
            // 2. Run income events, adding the income to the cash investment.
            // ===============================================================

            let curYearIncome = 0;
            let curYearSS = 0;

            incomeEvents.filter(event => shouldRunEvent(event)).forEach(event => {
                
                // 2.a. The amount of this income event in the previous year needs to be stored and updated based on the
                // expected annual change in amount, because the expected annual change can be sampled from a
                // probability distribution, and the sampling is done each year.
                let expectedAnnualChange = SimulationUtils.sampleValueFromDistribution(event.changeDistribution);
                event.currAmount = event.changeAmtOrPct === 'amount' 
                    ? expectedAnnualChange + event.currAmount 
                    : (1 + expectedAnnualChange) * event.currAmount;
                
                // 2.b. If the inflation-adjustment flag is set, adjust the amount for inflation.
                if (event.adjustForInflation) {
                    event.currAmount = SimulationUtils.adjustNumber(event.currAmount, curInflationRate);
                }

                // 2.c. If user or their spouse is dead, omit their percentage of the amount.
                // The system removes the dead person's amount and transfers all ownership to the survivor.
                if (isUserDead() && event.userPct > 0) {
                    event.currAmount -= (event.currAmount * event.userPct);
                    event.userPct = 0;
                }
                if (isSpouseDead() && event.userPct < 100) {
                    event.currAmount -= (event.currAmount * (100 - event.userPct));
                    event.userPct = 100;
                }

                // 2.d. Add the income to the cash investment.
                cashInvestment.value += event.currAmount;
                
                // 2.e. Update running total curYearIncome.
                curYearIncome += event.currAmount;

                // 2.f. Update running total curYearSS of social security benefits if income type = social security
                if (event.isSocialSecurity) {
                    curYearSS += event.currAmount;
                }
            });

            // =========================================================================================================
            // 3. Perform the RMD for the previous year, if the user’s age is at least 74 and at the end of the previous
            // year, there is at least one investment with tax status = “pre-tax” and with a positive value.
            // =========================================================================================================

            // 3.a. The first RMD is for the year in which the user turns 73, and is paid in the year in which the user turns 74.
            if (getUserAge() >= 74) {
                // 3.b. Distribution period d = result from lookup of the user’s age in the most recent available RMD table
                let d = rmdTable[getUserAge()];

                // 3.c. s = sum of values of the investments with tax status = pre-tax, as of the end of the previous year.
                let s = 0;
                scenario.investments.filter(
                    investment => investment.accountTaxStatus === 'pre-tax'
                ).forEach(
                    investment => { s += investment.value; }
                );

                // 3.d. rmd = s / d
                let rmd = s / d;

                // 3.e. curYearIncome += rmd
                curYearIncome += rmd;

                // 3.f. Iterate over the investments in the RMD strategy in the given order, transferring each of them in-
                // kind to an investment with the same investment type and with tax status = “non-retirement”, until
                // the total amount transferred equals rmd. The last investment to be transferred might be partially
                // transferred.
                let remainingRmd = rmd;
                for (const investmentId of scenario.rmdStrategy) {
                    const investment = getInvestment(investmentId); // Find the investment by its UUID

                    // 3.g. “Transferring in-kind” means reducing the value of the source investment by the transferred
                    // amount, checking whether an investment with the same investment type and target tax status
                    // already exists, and if so, adding the transferred amount to its value, otherwise creating an
                    // investment with the same investment type, the target tax status = “after-tax retirement”, and value
                    // equal to the transferred amount.

                    if (!investment || investment.value <= 0) continue;
                    
                    // Ensure investment.value is a valid number
                    if (typeof investment.value !== 'number' || isNaN(investment.value)) {
                        // console.warn(`Invalid investment value for investment ${investment._id}: ${investment.value}`);
                        investment.value = 0;
                        continue;
                    }
                    
                    const transferAmount = Math.min(remainingRmd, investment.value); // Calculate how much we can transfer from this investment
                    investment.value -= transferAmount; // Reduce the source investment's value
                    
                    // Find or create the target investment
                    let targetInvestment = scenario.investments.find(inv => 
                        inv.type.name === investment.type.name && 
                        inv.accountTaxStatus === 'non-retirement'
                    );
                    
                    if (!targetInvestment) {
                        // Create new non-retirement investment with same type
                        targetInvestment = {
                            _id: crypto.randomUUID(),
                            type: investment.type,
                            accountTaxStatus: 'non-retirement',
                            value: 0,
                            initialValue: 0,
                            purchasePrice: 0
                        };
                        scenario.investments.push(targetInvestment);
                    }
                    
                    targetInvestment.value += transferAmount; // Add the transferred amount to the target investment
                    remainingRmd -= transferAmount; // Update remaining RMD amount
                    if (remainingRmd <= 0) break; // If we've transferred the full RMD amount, we can stop
                }
                
                // If we couldn't transfer the full RMD amount, log a warning
                if (remainingRmd > 0) {
                    console.warn(`Could not transfer full RMD amount. Remaining: ${remainingRmd}`);
                }
            }

            // =================================================================================================
            // 4. Update the values of investments, reflecting expected annual return, reinvestment of generated
            // income, and subtraction of expenses.
            // =================================================================================================

            scenario.investments.forEach(investment => {
                // 4.a. Calculate the generated income, using the given fixed amount or percentage, or sampling from the
                // specified probability distribution.
                let expectedAnnualIncome = SimulationUtils.sampleValueFromDistribution(investment.type.expectedAnnualIncome);
                let generatedIncome = investment.type.incomeAmtOrPct === 'amount' ? expectedAnnualIncome : expectedAnnualIncome * investment.value;

                // 4.b. Add the income to curYearIncome, if the investment’s tax status is ‘non-retirement’ and the
                // investment type’s taxability is ‘taxable’. (For investments in pre-tax retirement accounts, the income
                // is taxable in the year it is withdrawn from the account. For investments in after-tax retirement
                // accounts, the income is not taxable.)
                if (investment.accountTaxStatus === 'non-retirement' && investment.type.taxability) {
                    curYearIncome += generatedIncome;
                }

                // 4.c. Add the income to the value of the investment.
                let initialInvestmentValue = investment.value;
                investment.value += generatedIncome;

                // 4.d. Calculate the change in value, using the given fixed amount or percentage, or sampling from the
                // specified probability distribution.
                let investmentValueChange = investment.value - initialInvestmentValue;

                // 4.e. Calculate this year’s expenses, by multiplying the expense ratio and the average value of the
                // investment (i.e., the average of its value at the beginning and end of the year). Subtract the
                // expenses from the value.
                let avgValue = (investment.value + initialInvestmentValue) / 2;
                let expenses = investment.type.expenseRatio * avgValue;
                investment.value -= expenses;
            });

            // ============================================================
            // 5. Run the Roth conversion (RC) optimizer, if it is enabled.
            // ============================================================

            if (scenario.rothConversionOpt && curYear >= scenario.rothConversionStart && curYear < scenario.rothConversionEnd) {
                // 5.a. Look up curYearFedTaxableIncome in the inflation-adjusted federal income tax brackets for the
                // current year, to find the user’s current federal income tax bracket, where curYearFedTaxableIncome
                // = curYearIncome – 0.15*curYearSS. u = the upper limit of that bracket.
                let curYearFedTaxableIncome = curYearIncome - 0.15*curYearSS;
                let curYearFedIncomeTaxBracket = SimulationUtils.lookUpTaxBracket(curFederalTaxBrackets.incomeTaxBrackets, curYearFedTaxableIncome);
                let u = curYearFedIncomeTaxBracket.upperBound;

                // 5.b. Amount of Roth conversion rc = u – (curYearFedTaxableIncome - standardDeduction).
                rc = u - (curYearFedTaxableIncome - curFederalTaxBrackets.standardDeduction);

                // 5.c. Iterate over the investments in the Roth conversion strategy in the given order, transferring each of
                // them in-kind to an investment with the same investment type and with tax status = “after-tax
                // retirement”, until the total amount transferred equals rc. The last investment to be transferred
                // might be partially transferred.

                let remainingRc = rc;
                for (const investmentId of scenario.rothConversionStrategy) {
                    const investment = getInvestment(investmentId); // Find the investment by its UUID
                    
                    if (!investment || investment.value <= 0) continue;
                    
                    // Ensure investment.value is a valid number
                    if (typeof investment.value !== 'number' || isNaN(investment.value)) {
                        // console.warn(`Invalid investment value for investment ${investment._id}: ${investment.value}`);
                        investment.value = 0;
                        continue;
                    }
                    
                    const transferAmount = Math.min(remainingRc, investment.value);
                    investment.value -= transferAmount;
                    
                    // Find or create the target investment
                    let targetInvestment = scenario.investments.find(inv => 
                        inv.type.name === investment.type.name && 
                        inv.accountTaxStatus === 'after-tax'
                    );
                    
                    if (!targetInvestment) {
                        // Create new after-tax retirement investment with same type
                        targetInvestment = {
                            _id: crypto.randomUUID(),
                            type: investment.type,
                            accountTaxStatus: 'after-tax',
                            value: 0,
                            initialValue: 0,
                            purchasePrice: 0
                        };
                        scenario.investments.push(targetInvestment);
                    }
                    
                    targetInvestment.value += transferAmount;
                    remainingRc -= transferAmount;
                    
                    if (remainingRc <= 0) break;
                }
                
                // If we couldn't transfer the full Roth conversion amount, log a warning
                if (remainingRc > 0) {
                    console.warn(`Could not transfer full Roth conversion amount. Remaining: ${remainingRc}`);
                }

                // 5.d.curYearIncome += rc.
                curYearIncome += rc;
            }

            // ==================================================================================================
            // 6. Pay non-discretionary expenses and the previous year’s taxes, i.e., subtract them from the cash
            // investment. Perform additional withdrawals if needed to pay them.
            // ==================================================================================================

            let prevYearlyData = simulationYearlyData.find(d => d.year === curYear - 1);
            let prevYearFederalIncomeTax = 0;
            let prevYearStateIncomeTax = 0;
            let prevYearCapitalGainsTax = 0;
            let prevYearEarlyWithdrawlTax = 0;

            if (prevYearlyData) {
                // 6.a. Calculate the previous year’s federal and state income tax using the values of curYearIncome and
                // curYearSS from the previous year, and inflation-adjusted federal and state income tax data (rates,
                // brackets, and standard deduction) for the previous year.

                // Calculate federal income tax
                let prevYearFedTaxableIncome = prevYearlyData.income - 0.15 * prevYearlyData.socialSecurity;
                let standardDeduction = prevYearFederalTaxBrackets.standardDeduction || 0;
                prevYearFedTaxableIncome = Math.max(0, prevYearFedTaxableIncome - standardDeduction);
                prevYearFederalIncomeTax = SimulationUtils.calculateTaxFromBrackets(
                    prevYearFedTaxableIncome, 
                    prevYearFederalTaxBrackets.incomeTaxBrackets
                );
                
                // Calculate income state tax if applicable (in a similar fashion as federal)
                if (prevYearStateTaxBrackets) {
                    let prevYearStateTaxableIncome = prevYearlyData.income;
                    let stateStandardDeduction = prevYearStateTaxBrackets.standardDeduction || 0;
                    prevYearStateTaxableIncome = Math.max(0, prevYearStateTaxableIncome - stateStandardDeduction);
                    prevYearStateIncomeTax = SimulationUtils.calculateTaxFromBrackets(
                        prevYearStateTaxableIncome, 
                        prevYearStateTaxBrackets.incomeTaxBrackets
                    );
                }

                // 6.b. Calculate the previous year’s capital gains tax using the value of curYearGains from the previous
                // year, and inflation-adjusted federal capital gains tax data for the previous year. Note that capital 
                // gains tax cannot be negative, even if the user has a net loss.
                prevYearCapitalGainsTax = Math.max(0, SimulationUtils.calculateTaxFromBrackets(
                    prevYearlyData.yearGains, 
                    prevYearFederalTaxBrackets.capitalGainsBrackets
                ));
                if (prevYearStateTaxBrackets && prevYearStateTaxBrackets.capitalGainsBrackets) {
                    prevYearCapitalGainsTax += Math.max(0, SimulationUtils.calculateTaxFromBrackets(
                        prevYearlyData.yearGains, 
                        prevYearStateTaxBrackets.capitalGainsBrackets
                    ));
                }

                // 6.c. Calculate the previous year’s early withdrawal tax, using the value of curYearEarlyWithdrawals from
                // the previous year.
                prevYearEarlyWithdrawlTax = prevYearlyData.earlyWithdrawals * 0.1;    
            }

            // 6.d. total payment amount P = sum of non-discretionary expenses in the current year plus the previous
            // year’s taxes. Calculate the amounts of expense events in a similar way as calculating the amounts of
            // income events.
            let P = prevYearFederalIncomeTax + prevYearStateIncomeTax + prevYearCapitalGainsTax + prevYearEarlyWithdrawlTax;
            expenseEvents.filter(event => shouldRunEvent(event) && event.discretionary).forEach(event => {
                
                // Update and store the amount based on annual change.
                let expectedAnnualChange = SimulationUtils.sampleValueFromDistribution(event.changeDistribution);
                event.currAmount = event.changeAmtOrPct === 'amount' 
                    ? expectedAnnualChange + event.currAmount 
                    : (1 + expectedAnnualChange) * event.currAmount;
                
                // If the inflation-adjustment flag is set, adjust for inflation.
                if (event.adjustForInflation) {
                    event.currAmount = SimulationUtils.adjustNumber(event.currAmount, curInflationRate);
                }

                // If user or their spouse is dead, omit their percentage of the amount.
                // The system removes the dead person's amount and transfers all ownership to the survivor.
                if (isUserDead() && event.userPct > 0) {
                    event.currAmount -= (event.currAmount * event.userPct);
                    event.userPct = 0;
                }
                if (isSpouseDead() && event.userPct < 100) {
                    event.currAmount -= (event.currAmount * (100 - event.userPct));
                    event.userPct = 100;
                }

                // Subtract from cash investment.
                cashInvestment.value -= event.currAmount;

                // P calculation
                P += event.currAmount;
            });

            // 6.e. total withdrawal amount W = P - (amount of cash)
            let W = P - cashInvestment.value;
            
            // 6.f. Iterate over investments in the expense withdrawal strategy, selling them one by one, until the total
            // amount sold equals W. The last investment to be sold might be partially sold.

            let curYearGains = 0;
            let curEarlyWithdrawals = 0;

            let remainingW = W;
            for (const investmentId of scenario.expenseWithdrawalStrategy) {
                const investment = getInvestment(investmentId); // Find the investment by its UUID
                
                if (!investment || investment.value <= 0) continue;
                
                // Ensure investment.value is a valid number
                if (typeof investment.value !== 'number' || isNaN(investment.value)) {
                    // console.warn(`Invalid investment value for investment ${investment._id}: ${investment.value}`);
                    investment.value = 0;
                    continue;
                }

                // 6.f.i For each sale, compute the capital gain, and update running total curYearGains of capital gains,
                // if the sold investment’s tax status is 'non-retirement'. If the entire investment is
                // sold, capital gain = current value - purchase price, where purchase price = sum of the amounts
                // of purchases of this investment plus the initial value at the start of the simulation. Note that the
                // purchase price must be stored, and updated upon each purchase. If a fraction f of an
                // investment is sold, then capital gain = f * (current value - purchase price).

                let purchasePrice = investment.purchasePrice || 0;
                let saleAmount = Math.min(remainingW, investment.value);
                
                // Ensure we don't divide by zero
                let f = investment.value > 0 ? saleAmount / investment.value : 0; 
                let capitalGain = f * (investment.value - purchasePrice);
                investment.value -= saleAmount;

                if (investment.accountTaxStatus === 'non-retirement') {
                    // 6.f.ii Note that the capital “gain” may be negative (i.e., a loss), and that capital gains tax is paid on the
                    // net capital gain for the year. Note that capital gains in pre-tax retirement accounts are taxed as
                    // regular income upon withdrawal from the pre-tax retirement account.
                    curYearGains += capitalGain;
                }

                // 6.f.iii Update running total curYearIncome, if the investment sold is held in a pre-tax retirement
                // account. This reflects that we are both selling the investment and withdrawing the funds from
                // the pre-tax retirement account in order to pay the expense.
                if (investment.accountTaxStatus === 'pre-tax') {
                    curYearIncome += capitalGain;
                }

                // Update running total curYearEarlyWithdrawals, if the investment sold is held in a pre-tax or
                // after-tax retirement account and the user’s age is less than 59. If the user’s age equals 59, we
                // assume they perform this withdrawal after they turn 59½.
                if ((investment.accountTaxStatus === 'pre-tax' 
                    || investment.accountTaxStatus === 'after-tax')
                    && getUserAge() < 59) {
                    curEarlyWithdrawals += capitalGain;
                }
                
                if (remainingW <= 0) break;
            }

            // =====================================================================================================
            // 7. Pay discretionary expenses in the order given by the spending strategy, except stop if continuing
            // would reduce the user’s total assets below the financial goal. The last discretionary expense to be
            // paid can be partially paid, if incurring the entire expense would violate the financial goal. Perform
            // additional withdrawals if needed to pay them.
            // =====================================================================================================

            for (const eventSeriesId of scenario.spendingStrategy) {
                const event = allEvents.find(ev => ev.name === eventSeriesId);
                
                if (!shouldRunEvent(event)) {
                    continue;
                }

                // Update and store the amount based on annual change.
                let expectedAnnualChange = SimulationUtils.sampleValueFromDistribution(event.changeDistribution);
                event.currAmount = event.changeAmtOrPct === 'amount' 
                    ? expectedAnnualChange + event.currAmount 
                    : (1 + expectedAnnualChange) * event.currAmount;
                
                // If the inflation-adjustment flag is set, adjust for inflation.
                if (event.adjustForInflation) {
                    event.currAmount = SimulationUtils.adjustNumber(event.currAmount, curInflationRate);
                }

                // If user or their spouse is dead, omit their percentage of the amount.
                if (isUserDead() && event.userPct > 0) {
                    event.currAmount -= (event.currAmount * event.userPct);
                    event.userPct = 0;
                }
                if (isSpouseDead() && event.userPct < 100) {
                    event.currAmount -= (event.currAmount * (100 - event.userPct));
                    event.userPct = 100;
                }

                // Pay as much as possible without violating financial goal
                let maxAffordablePayment = getTotalAssets() - scenario.financialGoal;
                let amountToPay = Math.min(event.currAmount, Math.max(0, maxAffordablePayment));
                cashInvestment.value -= amountToPay;
            }

            // =======================================================================================================
            // 8. Run the invest event scheduled for the current year, if any, by using excess cash to buy investments
            // included in the asset allocation in the invest event, apportioning the excess cash according to that
            // asset allocation.
            // =======================================================================================================

            investEvents.filter(event => shouldRunEvent(event)).forEach(event => {
                
                // 8.a. Take the inflation-adjusted annual limit L on after-tax retirement account
                // contributions into account as follows. calculate B = sum of the amounts to buy of
                // investments with tax status = “after-tax retirement”. If B > L, then uniformly scale down
                // the purchases of after-tax investments by L/B, and uniformly scale up the purchases of
                // non-retirement investments, so that the grand total still equals the amount of excess cash. 

                let L = curUserRetireContributionLimit; // Ignore spouse for now.
                let B = 0;
                event.selectedInvestments.forEach(investmentId => {
                    const investment = getInvestment(investmentId); // Find the investment by its UUID
                    if (investment.accountTaxStatus === 'after-tax') {
                        B += investment.value;
                    }
                });
                if (B > L) {
                    let scalingFactor = L / B;
                    let moneyToRealloc = 0;
                    event.selectedInvestments.forEach(investmentId => {
                        const investment = getInvestment(investmentId); // Find the investment by its UUID
                        if (investment.accountTaxStatus === 'after-tax') {
                            moneyToRealloc = investment.purchasePrice * (1-scalingFactor);
                            investment.purchasePrice *= scalingFactor;
                        }
                        if (investment.accountTaxStatus === 'non-retirement') {
                            investment.purchasePrice += moneyToRealloc;
                            moneyToRealloc = 0;
                        } 
                    });

                    // If still money left over, fallback (dump it in the first investment in the strategy)
                    if (moneyToRealloc > 0) {
                        scenario.investments.find(inv => inv._id === event.selectedInvestments[0]._id).purchasePrice += moneyToRealloc;
                    }
                }
            });

            // ======================================================================================================
            // 9. Run rebalance events scheduled for the current year, by selling and buying the investments included
            // in the specified asset allocation to achieve the specified ratios between their values.
            // ======================================================================================================

            rebalanceEvents.filter(event => shouldRunEvent(event)).forEach(event => {

                // 9.a. a. Compute the target value of each investment, and then adjust its amount by buying or selling, as
                // appropriate. For each sale of an investment whose tax status is “non-retirement”,
                // calculate the capital gains on the sale and update curYearGains. In principle, I would first process all
                // of the sales, and then all of the purchases. In practice, the processing order doesn’t affect the
                // outcome.

                // Calculate total value of all investments in the rebalance strategy
                let totalValue = 0;
                const selectedInvestments = scenario.investments.filter(inv => 
                    event.selectedInvestments.includes(inv._id)
                );
                
                selectedInvestments.forEach(inv => {
                    totalValue += inv.value;
                });

                // Calculate target values for each investment based on allocation
                const targetValues = new Map();
                
                // Handle both fixed and glide path allocations
                if (event.allocationType === 'fixed') {
                    // For fixed allocation, use the 'value' property
                    for (const [investmentId, allocation] of event.allocations.entries()) {
                        const targetValue = totalValue * allocation.value;
                        targetValues.set(investmentId, targetValue);
                    }
                } else if (event.allocationType === 'glide') {
                    // For glide path, interpolate between initial and final values based on current year
                    const yearsElapsed = curYear - event.start;
                    const totalYears = event.duration;
                    const progress = Math.min(1, Math.max(0, yearsElapsed / totalYears));
                    
                    for (const [investmentId, allocation] of event.allocations.entries()) {
                        const interpolatedAllocation = allocation.initial + 
                            (allocation.final - allocation.initial) * progress;
                        const targetValue = totalValue * interpolatedAllocation;
                        targetValues.set(investmentId, targetValue);
                    }
                }

                // Process sales first (investments that need to be reduced)
                for (const investment of selectedInvestments) {
                    const targetValue = targetValues.get(investment._id) || 0;
                    
                    if (investment.value > targetValue) {
                        const amountToSell = investment.value - targetValue; // Need to sell some of this investment
                        
                        // Calculate capital gains for non-retirement investments
                        if (investment.accountTaxStatus === 'non-retirement') {
                            // Ensure we don't divide by zero
                            const saleFraction = investment.value > 0 ? amountToSell / investment.value : 0; // Calculate the fraction of the investment being sold 
                            const purchasePrice = investment.purchasePrice || 0;
                            const capitalGain = saleFraction * (investment.value - purchasePrice); // Calculate capital gain (or loss)
                            curYearGains += capitalGain; // Update running total of capital gains
                            investment.purchasePrice = purchasePrice * (1 - saleFraction); // Update the purchase price for future calculations
                        }
                        
                        investment.value = targetValue; // Reduce the investment value
                        cashInvestment.value += amountToSell; // Add the proceeds to cash
                    }
                }

                // Process purchases (investments that need to be increased)
                for (const investment of selectedInvestments) {
                    const targetValue = targetValues.get(investment._id) || 0;
                    
                    if (investment.value < targetValue) {
                        const amountToBuy = targetValue - investment.value; // Need to buy more of this investment
                        
                        // Check if have enough cash
                        if (cashInvestment.value >= amountToBuy) {
                            investment.value = targetValue; // Update the investment value
                            
                            // Update the purchase price for future capital gains calculations
                            if (investment.accountTaxStatus === 'non-retirement') {
                                investment.purchasePrice = (investment.purchasePrice || 0) + amountToBuy;
                            }
                            
                            cashInvestment.value -= amountToBuy; // Reduce cash
                        } else {
                            // console.warn(`Not enough cash to fully rebalance investment ${investment._id}`); 
                            
                            // Use whatever cash is available
                            const availableCash = cashInvestment.value;
                            if (availableCash > 0) {
                                investment.value += availableCash;
                                
                                // Update the purchase price for future capital gains calculations
                                if (investment.accountTaxStatus === 'non-retirement') {
                                    investment.purchasePrice = (investment.purchasePrice || 0) + availableCash;
                                }
                                
                                cashInvestment.value = 0;
                            }
                        }
                    }
                }
            });

            // Store the yearly data for analysis
            simulationYearlyData.push({
                year: curYear,
                income: curYearIncome,
                socialSecurity: curYearSS,
                inflationRate: curInflationRate,
                investments: scenario.investments.map(inv => { 
                    // Ensure value is a valid number
                    const validValue = (typeof inv.value === 'number' && !isNaN(inv.value)) ? inv.value : 0;
                    
                    // Ensure accountTaxStatus is a valid string
                    const validAccountTaxStatus = (typeof inv.accountTaxStatus === 'string' && inv.accountTaxStatus) 
                        ? inv.accountTaxStatus 
                        : 'non-retirement'; // Default value
                    
                    return {
                        id: inv._id,
                        type: inv.type.name,
                        accountTaxStatus: validAccountTaxStatus,
                        value: validValue
                    };
                }),
                yearGains: curYearGains,
                earlyWithdrawals: curEarlyWithdrawals,
                userAge: getUserAge(),
                spouseAge: getSpouseAge(),
                isUserAlive: !isUserDead(),
                isSpouseAlive: !isSpouseDead()
            });

            // Update prev year federal and state tax info.
            // This is not saved in simulationYearlyData as
            // 1. I don't believe it is needed and
            // 2. It would be extremely space inefficient.
            prevYearFederalTaxBrackets = curFederalTaxBrackets;
            prevYearStateTaxBrackets = curStateTaxBrackets;

            // Move on to the next year
            curYear += 1;
        }

        // =================
        // END OF SIMULATION
        // =================

        const simulationResults = {
            endYear: curYear,
            yearlyData: simulationYearlyData
        };

        return {
            simulationId,
            result: simulationResults
        };

    } catch (error) {
        console.error('Error in simulation:', error);
        throw error;
    }
}

// Handle messages from the parent thread
parentPort.on('message', async (data) => {
    try { 
        const result = await runSingleSimulation(
            data.scenario,
            data.simulationId,
            data.federalTax,
            data.stateTax,
            data.rmdTable
        );
        parentPort.postMessage({ success: true, data: result });
    } catch (error) {
        console.error('Error in simulation:', error);
        parentPort.postMessage({ success: false, error: error.message });
    }
}); 