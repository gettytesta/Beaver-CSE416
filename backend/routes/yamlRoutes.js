const express = require('express');
const router = express.Router();
const yamlController = require('../controllers/yamlController');
const { upload } = require('../utils/fileUtils');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/yaml/scenario/import
 * @desc    Import a scenario from a YAML file
 * @access  Private
 * @param   {File} yamlFile - The YAML file to import
 * @returns {Object} Created scenario object
 */
router.post('/scenario/import', upload.single('yamlFile'), yamlController.importScenarioYaml);

/**
 * @route   GET /api/yaml/scenario/export/:id
 * @desc    Export a scenario as a YAML file
 * @access  Private
 * @param   {string} id - ID of the scenario to export
 * @returns {File} YAML file download
 */
router.get('/scenario/export/:id', yamlController.exportScenarioYaml);

/**
 * @route   POST /api/yaml/statetax/import
 * @desc    Import a state tax configuration from a YAML file
 * @access  Private
 * @param   {File} yamlFile - The YAML file to import
 * @returns {Object} Created state tax configuration object
 */
router.post('/statetax/import', upload.single('yamlFile'), yamlController.importStateTaxYaml);

/**
 * @route   GET /api/yaml/statetax
 * @desc    Get all state tax YAML configurations for the current user
 * @access  Private
 * @returns {Array} Array of state tax configuration objects
 */
router.get('/statetax', yamlController.getStateTaxYamls);

/**
 * @route   DELETE /api/yaml/statetax/:id
 * @desc    Delete a state tax YAML configuration
 * @access  Private
 * @param   {string} id - ID of the state tax configuration to delete
 * @returns {Object} Success message
 */
router.delete('/statetax/:id', yamlController.deleteStateTaxYaml);

module.exports = router; 