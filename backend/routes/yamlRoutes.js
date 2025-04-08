const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const yamlController = require('../controllers/yamlController');
const auth = require('../middleware/authMiddleware');

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
 * @route   POST /api/yaml/scenario
 * @desc    Import a scenario from YAML
 * @access  Private
 * @returns {Object} Created scenario object
 */
router.post('/scenario', auth, upload.single('file'), yamlController.importScenarioYaml);

/**
 * @route   GET /api/yaml/scenario/:id
 * @desc    Export a scenario as YAML
 * @access  Private
 * @returns {Object} YAML representation of the scenario
 */
router.get('/scenario/:id', auth, yamlController.exportScenarioYaml);

/**
 * @route   GET /api/yaml/statetax/available
 * @desc    Get list of states that have YAML tax files available
 * @access  Public
 * @returns {Object} List of states with available tax YAML files
 */
router.get('/statetax/available', yamlController.getAvailableStateTaxFiles);

module.exports = router; 