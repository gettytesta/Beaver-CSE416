const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

/**
 * @route   POST /api/simulations/:scenarioId
 * @desc    Run multiple simulations on a scenario in parallel using worker threads
 * @access  Public - both authenticated and guest users can run simulations
 * @param   {string} scenarioId - ID of the scenario to simulate
 * @body    {Object} simulationParams
 * @body    {number} simulationParams.numSimulations - Number of simulations to run (default: 1000, max: 10000)
 * @returns {Object} Simulation results containing statistics and data
 */
router.post('/:scenarioId', simulationController.runSimulation);

module.exports = router; 