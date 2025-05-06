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

        // Run the correct simulation based on the amount of parameters.
        const selectedParameter = req.body.selectedParameter || { parameterType: 'noParameters' };
        if (selectedParameter.parameterType === 'noParameters') {
            results = await runParallelSimulations(scenario, numSimulations, federalTax, stateTax, rmdTable);
        } else if (selectedParameter.parameterType === 'oneDimensional') {
            const { lowerBound, upperBound, delta } = simulationUtils.getBoundsAndDelta(selectedParameter);

            for (let param = lowerBound; param <= upperBound; param += delta) {
                console.log(param); // test

                // make a copy of the scenario,
                let scenarioCopy = JSON.parse(JSON.stringify(scenario.toObject())); 

                // set the proper value of what needs to be set based on the selectedParameter values to param
                if (selectedParameter.subParameter === 'rothOptimizer') {

                } else if (selectedParameter.subParameter === 'startYearDuration') {

                } else if (selectedParameter.subParameter === 'incomeExpenseInitial') {

                } else if (selectedParameter.subParameter === 'investmentPercentage') {

                }

                // run simulation, collect result and append to results
                let result = await runParallelSimulations(scenarioCopy, 1, federalTax, stateTax, rmdTable);
                results.push(result);

                // reseed
                simulationUtils.setSeed(seed);
            }

        } else if (selectedParameter.parameterType === 'twoDimensional') {
            const { lowerBound1, upperBound1, delta1 } = simulationUtils.getBoundsAndDelta(selectedParameter);

            // TODO FIX THIS
            const { lowerBound2, upperBound2, delta2 } = simulationUtils.getBoundsAndDelta(selectedParameter); 

            for (let param1 = lowerBound1; param1 < upperBound1; param1 += delta1) {
                for (let param2 = lowerBound2; param2 < upperBound2; param2 += delta2) {
                    console.log(param1 + " " + param2); // test

                    // make a copy of the scenario,
                    let scenarioCopy = JSON.parse(JSON.stringify(scenario.toObject())); 

                    // set the proper value of what needs to be set based on the selectedParameter values to param
                    // TODO

                    // run simulation, collect result and append to results
                    let result = await runParallelSimulations(scenarioCopy, 1, federalTax, stateTax, rmdTable);
                    results.push(result);

                    // reseed
                    simulationUtils.setSeed(seed);
                }
            }
        }
     
        if (req.user) {
            const resultToLog = results[0].data; // First simulation result should be logged
            logService.logSimulationResult(req.user.name, resultToLog);
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

/**
 * Run multiple simulations in parallel using worker threads
 */
async function runParallelSimulations(scenario, numSimulations, federalTax, stateTax, rmdTable) {
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
                    scenario: JSON.parse(JSON.stringify(scenario.toObject())),
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
