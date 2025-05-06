const Scenario = require('../models/scenario').Scenario;
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const taxService = require('../services/taxService');
const logService = require('../services/logService');
const yamlUtils = require('../utils/yamlUtils');

// Maximum number of concurrent workers (adjust based on server capacity)
const MAX_CONCURRENT_WORKERS = Math.max(1, Math.floor(os.cpus().length * process.env.SIM_CPU_UTILIZATION_LIMIT || 0.5));
const MAX_SIMS_PER_REQUEST = process.env.MAX_SIMS_PER_REQUEST || 10000; 

exports.runSimulation = async (req, res) => {
    try {
        const { scenarioId } = req.params; // Get the scenario ID from the request
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
        
        // Collect simulation result
        const results = await runParallelSimulations(scenario, numSimulations, federalTax, stateTax, rmdTable);
        const resultToLog = results[0].data; // First simulation result should be logged
        // console.log(JSON.stringify(resultToLog, null, 4));
        logService.logSimulationResult("Client", resultToLog);

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
