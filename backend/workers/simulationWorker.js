const { parentPort, workerData } = require('worker_threads');
const { sampleValueFromDistribution, calculateRMD, calculateIncome, calculateExpense } = require('../utils/simulationUtils');

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
        const startYear = new Date().getFullYear();
        const userLifeExpectancy = sampleValueFromDistribution(scenario.userLifeExpectancy);
        const userDeathYear = startYear + userLifeExpectancy;
        const spouseLifeExpectancy = sampleValueFromDistribution(scenario.spouseLifeExpectancy);
        const spouseDeathYear = startYear + spouseLifeExpectancy;
        const endYear = Math.max(userDeathYear, spouseDeathYear); // user

        // Handle inflation adjusted tax brackets
        // TODO: Should capital gains be inflation adjusted?
        let federalIncomeTaxBrackets; // Inflation Adjusted
        let stateIncomeTaxBrackets; // Inflation Adjusted
        if (scenario.isMarriedCouple) {
            // System assumes filing status is Married filing jointly
            federalIncomeTaxBrackets = federalTax.marriedFilingJointly.incomeTaxBrackets;
            stateIncomeTaxBrackets = stateTax.marriedFilingJointly.incomeTaxBrackets;
        } else {
            // System assumes filing status is Single
            federalIncomeTaxBrackets = federalTax.single.incomeTaxBrackets;
            stateIncomeTaxBrackets = stateTax.single.incomeTaxBrackets;
        }

        // Handle inflation adjusted annual limits on retirement account contributions
        // TODO: Find out where to get this value, for now just assume 20000.
        // Idea: Implement new retirement account model, scrape IRS website for this information.
        let userRetireContributionLimit = 20000; // Inflation Adjusted
        let spouseRetireContributionLimit = 20000; // Inflation Adjusted

        let netWorth = scenario.initialLimit;
        const cashInvestmentValue = 0;

        let currentYear = startYear;
        const delta = 1; // Increment years by 1
        const simulationResults = {};

        // Initial setup of investments and cash
        let investments = scenario.investments.map(inv => ({
            ...inv,
            currentValue: inv.value
        }));

        // Main simulation loop here.
        while (currentYear < endYear) {

            // 1. Preliminaries

            // Get inflation rate
            const inflationRate = sampleValueFromDistribution(scenario.inflationAssumption);

            // Apply inflationRate to each tax bracket
            // TODO

            // Apply inflationRate to annual limit on retirement account contributions
            userRetireContributionLimit *= inflationRate;
            spouseRetireContributionLimit *= inflationRate;

            // 2. Run income events, adding the income to the cash investment.

            let userCurYearIncome = 0; // Income from income events
            let userCurYearSS = 0; // Income from social security benefits

            // Run income events
            for (const event of scenario.eventSeriesSet) {
                if (event.type === "income" && event.startYear <= currentYear) {
                    let eventIncome = calculateIncome(event, currentYear, inflationRate) * event.userFraction;
                    if (event.isSocialSecurity) {
                        userCurYearSS += eventIncome;
                    } else {
                        userCurYearIncome += eventIncome;
                    }
                }
            }

            cashInvestmentValue = cashInvestmentValue + userCurYearIncome + userCurYearSS;

            // 3. Perform the RMD for the previous year, if the user’s age is at least 74 and at the end of the previous
            // year, there is at least one investment with tax status = “pre-tax” and with a positive value.

            const preTaxInvestments = investments.filter(inv => 
                inv.accountTaxStatus === 'pretaxretirement' && inv.currentValue > 0
            );
            if (currentYear - startYear >= 74 && preTaxInvestments.length > 0) {
                const totalPreTaxValue = preTaxInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
                const rmdAmount = calculateRMD(rmdTable, totalPreTaxValue, currentYear - scenario.userBirthYear);
                
                // Withdraw RMD and add to cash
                cashInvestmentValue += rmdAmount;
            }

            // 4. Update the values of investments, reflecting expected annual return, reinvestment of generated
            // income, and subtraction of expenses.

            investments.forEach(inv => {
                const baseReturn = inv.type.expectedAnnualReturn;
                inv.currentValue *= (1 + baseReturn - inflationRate);
            });

            // Calculate total net worth for the year
            // const totalNetWorth = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
            // simulationResults[currentYear] = totalNetWorth;

            // 5. Run the Roth conversion (RC) optimizer, if it is enabled.

            // TODO

            // 6. Pay non-discretionary expenses and the previous year’s taxes, i.e., subtract them from the cash
            // investment. Perform additional withdrawals if needed to pay them.

            // TODO

            // 7. Pay discretionary expenses in the order given by the spending strategy, except stop if continuing
            // would reduce the user’s total assets below the financial goal. The last discretionary expense to be
            // paid can be partially paid, if incurring the entire expense would violate the financial goal. Perform
            // additional withdrawals if needed to pay them.

            // TODO

            // 8. Run the invest event scheduled for the current year, if any, by using excess cash to buy investments
            // included in the asset allocation in the invest event, apportioning the excess cash according to that
            // asset allocation.

            // TODO

            // 9. Run rebalance events scheduled for the current year, by selling and buying the investments included
            // in the specified asset allocation to achieve the specified ratios between their values.

            // TODO

            // ===============================================
            // Basic simulation algorithm for testing purposes
            // ===============================================

            // Income events
            let _totalIncome = 0;
            for (const event of scenario.eventSeriesSet) {
                if (event.type === "income" && event.startYear <= currentYear) {
                    _totalIncome += event.initialAmount * (event.isInflationAdjusted ? inflationRate : 1);
                }
            }

            // Expense events
            let _totalExpenses = 0;
            for (const event of scenario.eventSeriesSet) {
                if (event.type === "expense" && event.startYear <= currentYear) {
                    _totalExpenses += event.initialAmount * (event.isInflationAdjusted ? inflationRate : 1);
                }
            }

            // Investment growth
            let _totalInvestments = 0;
            for (const investmentId of scenario.investments) {
                // Assume a basic return of 5% for now (to be refined later)
                _totalInvestments += investmentId.value * 1.05;
            }

            // Net worth calculation
            netWorth += _totalIncome - _totalExpenses + _totalInvestments;
            simulationResults[currentYear] = netWorth;

            // ================================================

            // Move on to the next year
            currentYear += delta;
        }

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
        parentPort.postMessage({ success: false, error: error.message });
    }
}); 