const Scenario = require('../models/scenario').Scenario;
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const taxService = require('../services/taxService');
const logService = require('../services/logService');
const yamlUtils = require('../utils/yamlUtils');
const simulationUtils = require('../utils/simulationUtils');

// Maximum number of concurrent workers (adjust based on server capacity)
const MAX_CONCURRENT_WORKERS = Math.max(1, Math.floor(os.cpus().length * process.env.SIM_CPU_UTILIZATION_LIMIT || 0.5));
const MAX_SIMS_PER_REQUEST = process.env.MAX_SIMS_PER_REQUEST || 10000;

exports.runSimulation = async (req, res) => {
    try {
        const { scenarioId } = req.params; // Get the sim params from the request
        let numSimulations = parseInt(req.body.numSimulations) || 50;  // Get the number of simulations from the request body
        numSimulations = Math.min(numSimulations, MAX_SIMS_PER_REQUEST); // Enforce maximum number of simulations that can be run per request
        const scenario = await Scenario.findById(scenarioId); // Find the scenario

        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        console.log("Running simulation for scenarioId " + scenarioId);

        // Get federal tax and RMD table
        const federalTax = await taxService.getFederalTax();
        const rmdTable = await taxService.getRMDTable();

        if (!federalTax || !rmdTable) {
            return res.status(500).json({
                success: false,
                message: 'Failed to load tax data or RMD table'
            });
        }

        // Get state tax
        let stateTax = null;
        if (req.file) { // Check if user provided a YAML file for state tax
            stateTax = yamlUtils.convertYamlFileToStateTax(file);
        } else { // Otherwise try to get the state tax based on the users state of residence.
            stateTax = await taxService.getStateTax(scenario.userStateOfResidence);
        }

        let results = [];

        // set seed as current timestamp
        const seed = Date.now().toString();
        simulationUtils.setSeed(seed);

        if (req.body.parameterType === 'twoDimensional') {
            // 2d parameterization
            const param1 = req.body.param1;
            const param2 = req.body.param2;

            try {
                // Special case for Roth Optimizer (has no range)
                if (param1.subParameter === 'rothOptimizer' || param2.subParameter === 'rothOptimizer') {
                    const rothParam = param1.subParameter === 'rothOptimizer' ? param1 : param2;
                    const otherParam = param1.subParameter === 'rothOptimizer' ? param2 : param1;

                    // Get range for the non-Roth parameter
                    const otherLowerBound = parseInt(otherParam.range.lower);
                    const otherUpperBound = parseInt(otherParam.range.upper);
                    const otherStep = parseInt(otherParam.range.step);

                    // For each value in the range of the non-Roth parameter
                    for (let otherValue = otherLowerBound; otherValue <= otherUpperBound; otherValue += otherStep) {
                        // With Roth enabled
                        let scenarioCopy1 = JSON.parse(JSON.stringify(scenario.toObject()));
                        scenarioCopy1.rothConversionOpt = true;
                        scenarioCopy1.rothConversionStart = rothParam.rothStart;
                        scenarioCopy1.rothConversionEnd = rothParam.rothEnd;

                        // Apply the other parameter
                        applyParameterToScenario(scenarioCopy1, otherParam, otherValue);

                        let result1 = await runParallelSimulations(scenarioCopy1, 1, federalTax, stateTax, rmdTable);
                        let formattedResult1 = {
                            parameter1: {
                                name: param1.subParameter,
                                value: param1.subParameter === 'rothOptimizer' ? true : otherValue
                            },
                            parameter2: {
                                name: param2.subParameter,
                                value: param2.subParameter === 'rothOptimizer' ? true : otherValue
                            },
                            results: result1[0].data.result
                        };
                        results.push(formattedResult1);

                        // With Roth disabled
                        let scenarioCopy2 = JSON.parse(JSON.stringify(scenario.toObject()));
                        scenarioCopy2.rothConversionOpt = false;

                        // Apply the other parameter
                        applyParameterToScenario(scenarioCopy2, otherParam, otherValue);

                        let result2 = await runParallelSimulations(scenarioCopy2, 1, federalTax, stateTax, rmdTable);
                        let formattedResult2 = {
                            parameter1: {
                                name: param1.subParameter,
                                value: param1.subParameter === 'rothOptimizer' ? false : otherValue
                            },
                            parameter2: {
                                name: param2.subParameter,
                                value: param2.subParameter === 'rothOptimizer' ? false : otherValue
                            },
                            results: result2[0].data.result
                        };
                        results.push(formattedResult2);

                        simulationUtils.setSeed(seed); // reseed
                    }
                } else {
                    // Standard 2D parameter sweep (matrix of parameter combinations)
                    // Handle bounds for first parameter
                    const lowerBound1 = parseInt(param1.range.lower);
                    const upperBound1 = parseInt(param1.range.upper);
                    const step1 = parseInt(param1.range.step);

                    // Handle bounds for second parameter
                    const lowerBound2 = parseInt(param2.range.lower);
                    const upperBound2 = parseInt(param2.range.upper);
                    const step2 = parseInt(param2.range.step);

                    for (let paramValue1 = lowerBound1; paramValue1 <= upperBound1; paramValue1 += step1) {
                        for (let paramValue2 = lowerBound2; paramValue2 <= upperBound2; paramValue2 += step2) {
                            let scenarioCopy = JSON.parse(JSON.stringify(scenario.toObject()));

                            // Apply both parameters to the scenario
                            applyParameterToScenario(scenarioCopy, param1, paramValue1);
                            applyParameterToScenario(scenarioCopy, param2, paramValue2);

                            let result = await runParallelSimulations(scenarioCopy, 1, federalTax, stateTax, rmdTable);
                            let formattedResult = {
                                parameter1: {
                                    name: param1.subParameter,
                                    value: paramValue1
                                },
                                parameter2: {
                                    name: param2.subParameter,
                                    value: paramValue2
                                },
                                results: result[0].data.result
                            };
                            results.push(formattedResult);
                            simulationUtils.setSeed(seed); // reseed
                        }
                    }
                }
            } catch (error) {
                console.error("Error in 2D parameterization:", error);
                throw error; // Re-throw to be handled by the outer error handler
            }
        } else if (req.body.parameterType === 'oneDimensional') {
            // 1d
            const param1 = req.body.param1;
            if (param1.subParameter === 'rothOptimizer') {
                // Run two simulations, one with roth on and roth off
                let scenarioCopy1 = JSON.parse(JSON.stringify(scenario.toObject()));
                scenarioCopy1.rothConversionOpt = true;
                scenarioCopy1.rothConversionStart = param1.rothStart;
                scenarioCopy1.rothConversionEnd = param1.rothEnd;
                let result1 = await runParallelSimulations(scenarioCopy1, 1, federalTax, stateTax, rmdTable);
                let formattedResult1 = {
                    parameter: param1.subParameter,
                    value: true,
                    results: result1[0].data.result
                };

                let scenarioCopy2 = JSON.parse(JSON.stringify(scenario.toObject()));
                scenarioCopy2.rothConversionOpt = false;
                let result2 = await runParallelSimulations(scenarioCopy2, 1, federalTax, stateTax, rmdTable);
                let formattedResult2 = {
                    parameter: param1.subParameter,
                    value: false,
                    results: result2[0].data.result
                };

                results.push(formattedResult1);
                results.push(formattedResult2);
            } else {
                const lowerBound = parseInt(param1.range.lower);
                const upperBound = parseInt(param1.range.upper);
                const step = parseInt(param1.range.step);
                for (let paramValue = lowerBound; paramValue <= upperBound; paramValue += step) {
                    let scenarioCopy = JSON.parse(JSON.stringify(scenario.toObject()));

                    // Apply parameter to scenario
                    applyParameterToScenario(scenarioCopy, param1, paramValue);

                    let result = await runParallelSimulations(scenarioCopy, 1, federalTax, stateTax, rmdTable);
                    let formattedResult = {
                        parameter: param1.subParameter,
                        value: paramValue,
                        results: result[0].data.result
                    }
                    results.push(formattedResult);
                    simulationUtils.setSeed(seed); // reseed
                }
            }
        }
        else {
            // regular simulation
            let scenarioCopy = JSON.parse(JSON.stringify(scenario.toObject()));
            results = await runParallelSimulations(scenarioCopy, numSimulations, federalTax, stateTax, rmdTable);
        }

        if (req.user) {
            if (req.body.parameterType === 'twoDimensional') {
                logService.logSimulationResult(req.user.name, { result: results[0].results });
            }
            else if (req.body.parameterType === 'oneDimensional') {
                logService.logSimulationResult(req.user.name, { result: results[0].results });
            } else {
                const resultToLog = results[0].data; // First simulation result should be logged
                logService.logSimulationResult(req.user.name, resultToLog);
            }
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error running simulation',
            error: error.message
        });
    }
};

// Helper function to apply parameter settings to a scenario based on parameter type
function applyParameterToScenario(scenarioCopy, param, paramValue) {
    // For Roth Optimizer, we don't need to find events
    if (param.subParameter === 'rothOptimizer') {
        scenarioCopy.rothConversionOpt = paramValue;
        if (paramValue === true) {
            scenarioCopy.rothConversionStart = param.rothStart;
            scenarioCopy.rothConversionEnd = param.rothEnd;
        }
        return;
    }
    
    // For other parameters, we need to find the correct event
    // We need a reliable way to identify the same event in the copy
    // Let's directly modify the original code to avoid the ObjectId problem
    
    if (param.subParameter === 'startYearDuration') {
        // Process all events and make changes only to the matching one
        for (let i = 0; i < scenarioCopy.eventSeriesSet.length; i++) {
            // Check if this event matches by comparing a string representation of the _id
            // or other unique identifiers in the event
            if (scenarioCopy.eventSeriesSet[i]._id.toString() === param.eventId || 
                scenarioCopy.eventSeriesSet[i]._id === param.eventId) {
                
                if (param.selectedField === 'start') {
                    scenarioCopy.eventSeriesSet[i].start = { type: 'fixed', value: paramValue };
                } else if (param.selectedField === 'duration') {
                    scenarioCopy.eventSeriesSet[i].duration = { type: 'fixed', value: paramValue };
                }
                break;
            }
        }
    } else if (param.subParameter === 'incomeExpenseInitial') {
        for (let i = 0; i < scenarioCopy.eventSeriesSet.length; i++) {
            if (scenarioCopy.eventSeriesSet[i]._id.toString() === param.eventId || 
                scenarioCopy.eventSeriesSet[i]._id === param.eventId) {
                
                let event = scenarioCopy.eventSeriesSet[i];
                if (event.type === 'income') {
                    event.income.initialAmount = paramValue;
                } else if (event.type === 'expense') {
                    event.expense.initialAmount = paramValue;
                }
                break;
            }
        }
    } else if (param.subParameter === 'investmentPercentage') {
        for (let i = 0; i < scenarioCopy.eventSeriesSet.length; i++) {
            if (scenarioCopy.eventSeriesSet[i]._id.toString() === param.eventId || 
                scenarioCopy.eventSeriesSet[i]._id === param.eventId) {
                
                // First check if the required properties exist
                if (scenarioCopy.eventSeriesSet[i].invest && 
                    scenarioCopy.eventSeriesSet[i].invest.allocations && 
                    scenarioCopy.eventSeriesSet[i].invest.allocations.length >= 2) {
                    
                    scenarioCopy.eventSeriesSet[i].invest.allocations[0].initial = paramValue;
                    scenarioCopy.eventSeriesSet[i].invest.allocations[0].final = 1-paramValue;
                    scenarioCopy.eventSeriesSet[i].invest.allocations[1].initial = 1-paramValue;
                    scenarioCopy.eventSeriesSet[i].invest.allocations[1].final = paramValue;
                }
                break;
            }
        }
    }
}

/**
 * Run multiple simulations in parallel using worker threads
 */
async function runParallelSimulations(scenarioCopy, numSimulations, federalTax, stateTax, rmdTable) {
    return new Promise((resolve) => {
        const results = [];
        let completedWorkers = 0;
        let activeWorkers = 0;
        let nextSimulationId = 0;

        // This function creates and starts a new worker
        const startWorker = () => {
            if (nextSimulationId >= numSimulations || activeWorkers >= MAX_CONCURRENT_WORKERS) {
                return;
            }

            const simulationId = nextSimulationId++;
            activeWorkers++;

            // Create worker with scenario data
            const worker = new Worker(path.join(__dirname, '../workers/simulationWorker.js'), {
                workerData: {
                    scenario: scenarioCopy,
                    simulationId,
                    federalTax: JSON.parse(JSON.stringify(federalTax.toObject())),
                    stateTax: stateTax ? JSON.parse(JSON.stringify(stateTax.toObject())) : null,
                    rmdTable: JSON.parse(JSON.stringify(rmdTable.toObject()))
                }
            });

            // Handle message from worker when simulation is complete
            worker.on('message', (result) => {
                results.push(result);
                activeWorkers--;
                completedWorkers++;
                startWorker(); // Start a new worker

                // If all simulations are done, resolve the promise
                if (completedWorkers === numSimulations) {
                    resolve(results);
                }
            });

            // Handle errors
            worker.on('error', (err) => {
                console.error(`Worker error: ${err}`);
                activeWorkers--;
                completedWorkers++;

                startWorker(); // Start a new worker

                // If all simulations are done, resolve the promise
                if (completedWorkers === numSimulations) {
                    resolve(results);
                }
            });

            // Handle worker exit
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker stopped with exit code ${code}`);
                }
            });
        };

        // Start initial batch of workers
        for (let i = 0; i < Math.min(numSimulations, MAX_CONCURRENT_WORKERS); i++) {
            startWorker();
        }
    });
}
