const Scenario = require('../models/scenario').Scenario;
const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');

// Maximum number of simulations allowed per request
const MAX_SIMULATIONS = 10000;

// Maximum number of concurrent workers (adjust based on server capacity)
const MAX_CONCURRENT_WORKERS = Math.max(1, Math.floor(os.cpus().length * 0.75)); // Use 75% of available CPU cores

/**
 * Run multiple simulations on a scenario in parallel
 * Both authenticated and guest users can run simulations
 */
exports.runSimulation = async (req, res) => {
    try {
        
        const { scenarioId } = req.params; // Get the scenario ID from the request
        let numSimulations = parseInt(req.body.numSimulations) || 50;  // Get the number of simulations from the request body
        numSimulations = Math.min(numSimulations, MAX_SIMULATIONS); // Enforce maximum number of simulations
        const scenario = await Scenario.findById(scenarioId); // Find the scenario
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }
        
        // If user is authenticated, check if they have access
        if (req.user) {
            const isOwner = scenario.userId.toString() === req.user._id.toString();
            
            if (!isOwner) {
                // Check if scenario is shared with user
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
        
        // Run parallel simulations using worker threads
        const results = await runParallelSimulations(scenario, numSimulations);
        
        // Process and format the results
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
async function runParallelSimulations(scenario, numSimulations) {
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
                    simulationId
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