const Scenario = require('../models/scenario').Scenario;
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const taxService = require('../services/taxService');
const logService = require('../services/logService');

// Maximum number of concurrent workers (adjust based on server capacity)
const MAX_CONCURRENT_WORKERS = Math.max(1, Math.floor(os.cpus().length * process.env.SIM_CPU_UTILIZATION_LIMIT || 0.5));
const MAX_SIMS_PER_REQUEST = process.env.MAX_SIMS_PER_REQUEST || 10000; 

// TODO runSimulation does not feature support for Guest users to be able to run simulations.
// I'm still not sure how we're going to set up persisence when it comes to guests (MongoDB expiration date on files sounded pretty good)
// Two ideas for solution:
// - Set a expiration date on files when saving to MongoDB
// - Simply have Guest users send the scenario object itself in the request body

// TODO Still have to convert uploaded .yaml file to StateTax (see below)

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
        
        // A simulation can only be run if the user is authenticated and has access to the scenario.
        if (req.user) {
            const isOwner = scenario.userId.toString() === req.user._id.toString();
            if (!isOwner) {
                const sharedInfo = scenario.sharedWith.find(share => 
                    share.userId.toString() === req.user._id.toString()
                );
                if (!sharedInfo) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized to run simulation on this scenario'
                    });
                }
            }
        }

        // Get federal tax and RMD table
        const federalTax = await taxService.getFederalTax();
        const rmdTable = await taxService.getRMDTable();

        // Get state tax
        let stateTax = null;
        if (req.file) { // Check if user provided a YAML file for state tax
            // TODO convert the uploaded YAML file to StateTax.
            // there is a convertYamlToStateTax in yamlUtils but that requires a filepath, not the actual file itself, so idk
            // maybe create a uploads folder? then store the file there (With a deletion timer) and pass the filepath?
            stateTax = null; 
        } else { // Otherwise try to get the state tax based on the users state of residence.
            stateTax = await taxService.getStateTax(scenario.userStateOfResidence);
        }
        
        // Collect and format simulation result
        const results = await runParallelSimulations(scenario, numSimulations, federalTax, stateTax, rmdTable);
        const resultToLog = results[0]; // First simulation result should be logged
        await logService.logSimulationResult(req.user.username, resultToLog);
        const formattedResults = formatSimulationResults(results, scenario);
        
        res.status(200).json({
            success: true,
            data: formattedResults
        });
    } catch (error) {
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
                    scenario: scenario.toObject(),
                    simulationId,
                    federalTax,
                    stateTax,
                    rmdTable
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

/**
 * Format simulation results for client response
 */
function formatSimulationResults(results, scenario) {

    // TODO: implement this function
    
    return {
        scenarioId: scenario._id,
        scenarioName: scenario.name,
        numSimulations: results.length,
        timestamp: new Date(),
        // TODO more results
    };
} 