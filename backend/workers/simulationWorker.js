const { parentPort, workerData } = require('worker_threads');
const SimulationUtils = require('../utils/simulationUtils');

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

        let currYear = startYear;

        // Save tax brackets, they are inflation adjusted every year.
        // System assumes filing status is Married filing jointly if the scenario is of a married couple, otherwise single.
        let currFederalIncomeTaxBrackets = scenario.isMarriedCouple ? federalTax.marriedFilingJointly.incomeTaxBrackets : federalTax.single.incomeTaxBrackets;
        let currStateIncomeTaxBrackets = scenario.isMarriedCouple ? stateTax.marriedFilingJointly.incomeTaxBrackets : stateTax.single.incomeTaxBrackets;

        // Save annual limits on retirement account contributions, they are inflation adjusted every year.
        let currUserRetireContributionLimit = scenario.userRetireContributionLimit;
        let currSpouseRetireContributionLimit = scenario.spouseRetireContributionLimit;

        // Save active events
        const allEvents = SimulationUtils.initializeEvents (scenario.eventSeriesSet);
        let incomeEvents = allEvents.filter(event => event.type === 'income');
        let expenseEvents = allEvents.filter(event => event.type === 'expense');
        let investEvents = allEvents.filter(event => event.type === 'invest');
        let rebalanceEvents = allEvents.filter(event => event.type === 'rebalance');
        
        // Cash investment
        let cashInvestment = scenario.investments.find(investment => {investment.type.name === 'cash'});

        // Helper functions
        const isUserDead = () => currYear >= userDeathYear;
        const isSpouseDead = () => currYear >= spouseDeathYear;
        const getUserAge = () => currYear - scenario.userBirthYear;
        const shouldRunEvent = (event) => currYear >= event.start && currYear <= event.start + event.duration;

        // ====================
        // MAIN SIMULATION LOOP
        // ====================

        while (currYear < endYear) {

            // ================
            // 1. Preliminaries
            // ================

            // a. Get current year's inflation rate.
            const currInflationRate = SimulationUtils.sampleValueFromDistribution(scenario.inflationAssumption);

            // b. Compute and store inflation-adjusted tax brackets for the current year.
            currFederalIncomeTaxBrackets = SimulationUtils.adjustTaxBrackets(currFederalIncomeTaxBrackets, currInflationRate);
            currStateIncomeTaxBrackets = SimulationUtils.adjustTaxBrackets(currStateIncomeTaxBrackets, currInflationRate);

            // c. Compute and store inflation-adjusted annual limits on retirement account contributions.
            currUserRetireContributionLimit = SimulationUtils.adjustNumber(currUserRetireContributionLimit, currInflationRate);
            currSpouseRetireContributionLimit = SimulationUtils.adjustNumber(currSpouseRetireContributionLimit, currInflationRate);

            // ===============================================================
            // 2. Run income events, adding the income to the cash investment.
            // ===============================================================

            let curYearIncome = 0;
            let curYearSS = 0;

            incomeEvents.forEach(event => {
                if (!shouldRunEvent(event)) return;
                
                // a. Update and store the amount based on annual change.
                let expectedAnnualChange = SimulationUtils.sampleValueFromDistribution(event.changeDistribution);
                event.currAmount = event.changeAmtOrPct === 'amount' 
                    ? expectedAnnualChange + event.currAmount 
                    : (1 + expectedAnnualChange) * event.currAmount;
                
                // b. If the inflation-adjustment flag is set, adjust for inflation.
                if (event.adjustForInflation) {
                    event.currAmount = SimulationUtils.adjustNumber(event.currAmount, currInflationRate);
                }

                // c. If user or their spouse is dead, omit their percentage of the amount.
                // The system removes the dead person's amount and transfers all ownership to the survivor.
                if (isUserDead() && event.userPct > 0) {
                    event.currAmount -= (event.currAmount * event.userPct);
                    event.userPct = 0;
                }
                if (isSpouseDead() && event.userPct < 100) {
                    event.currAmount -= (event.currAmount * (100 - event.userPct));
                    event.userPct = 100;
                }

                // d. Add the income to the cash investment.
                cashInvestment.value += event.currAmount;
                
                // e. Update running total curYearIncome.
                curYearIncome += event.currAmount;

                // f. Update running total curYearSS of social security benefits if income type = social security
                if (event.isSocialSecurity) {
                    curYearSS += event.currAmount;
                }
            });

            // =========================================================================================================
            // 3. Perform the RMD for the previous year, if the user’s age is at least 74 and at the end of the previous
            // year, there is at least one investment with tax status = “pre-tax” and with a positive value.
            // =========================================================================================================

            // a. The first RMD is for the year in which the user turns 73, and is paid in the year in which the user turns 74.
            if (getUserAge() >= 74) {

            }

            // =================================================================================================
            // 4. Update the values of investments, reflecting expected annual return, reinvestment of generated
            // income, and subtraction of expenses.
            // =================================================================================================

            // TODO

            // ============================================================
            // 5. Run the Roth conversion (RC) optimizer, if it is enabled.
            // ============================================================

            // TODO

            // ==================================================================================================
            // 6. Pay non-discretionary expenses and the previous year’s taxes, i.e., subtract them from the cash
            // investment. Perform additional withdrawals if needed to pay them.
            // ==================================================================================================

            // TODO

            // =====================================================================================================
            // 7. Pay discretionary expenses in the order given by the spending strategy, except stop if continuing
            // would reduce the user’s total assets below the financial goal. The last discretionary expense to be
            // paid can be partially paid, if incurring the entire expense would violate the financial goal. Perform
            // additional withdrawals if needed to pay them.
            // =====================================================================================================

            // TODO

            // =======================================================================================================
            // 8. Run the invest event scheduled for the current year, if any, by using excess cash to buy investments
            // included in the asset allocation in the invest event, apportioning the excess cash according to that
            // asset allocation.
            // =======================================================================================================

            // TODO

            // ======================================================================================================
            // 9. Run rebalance events scheduled for the current year, by selling and buying the investments included
            // in the specified asset allocation to achieve the specified ratios between their values.
            // ======================================================================================================

            // TODO

            // Move on to the next year
            currYear += 1;
        }

        // =================
        // END OF SIMULATION
        // =================

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