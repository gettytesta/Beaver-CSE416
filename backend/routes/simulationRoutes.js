const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const simulationController = require('../controllers/simulationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/simulations/:scenarioId
 * @desc    Run multiple simulations on a scenario in parallel using worker threads
 * @access  Public - both authenticated and guest users can run simulations
 * @param   {string} scenarioId - ID of the scenario to simulate
 * @body    {Object} simulationParams
 * @body    {number} simulationParams.numSimulations - Number of simulations to run (default: 1000, max: 10000)
 * @body    {File} [yamlFile] - Optional YAML file for state tax data
 * @returns {Object} Simulation results containing statistics and data
 */
router.post('/:scenarioId', upload.single('yamlFile'), simulationController.runSimulation);

module.exports = router; 