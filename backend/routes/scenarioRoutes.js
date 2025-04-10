const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const scenarioShareController = require('../controllers/scenarioShareController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/scenarios
 * @desc    Get all scenarios for the current user (both owned and shared)
 * @access  Private
 * @returns {Array} Array of scenario objects
 */
router.get('/', scenarioController.getScenarios);

/**
 * @route   GET /api/scenarios/:id
 * @desc    Get a single scenario by ID
 * @access  Private
 * @param   {string} id - ID of the scenario to retrieve
 * @returns {Object} Scenario object
 */
router.get('/:id', scenarioController.getScenario);

/**
 * @route   POST /api/scenarios
 * @desc    Create a new scenario
 * @access  Private
 * @body    {Object} scenario - Scenario data to create
 * @returns {Object} Created scenario object
 */
router.post('/', scenarioController.createScenario);

/**
 * @route   PUT /api/scenarios/:id
 * @desc    Update an existing scenario
 * @access  Private
 * @param   {string} id - ID of the scenario to update
 * @body    {Object} scenario - Updated scenario data
 * @returns {Object} Updated scenario object
 */
router.put('/:id', scenarioController.updateScenario);

/**
 * @route   DELETE /api/scenarios/:id
 * @desc    Delete a scenario
 * @access  Private
 * @param   {string} id - ID of the scenario to delete
 * @returns {Object} Success message
 */
router.delete('/:id', scenarioController.deleteScenario);

/**
 * @route   POST /api/scenarios/:id/share
 * @desc    Share a scenario with another user
 * @access  Private
 * @param   {string} id - ID of the scenario to share
 * @body    {string} userId - ID of the user to share with
 * @returns {Object} Success message
 */
router.post('/:id/share', scenarioShareController.shareScenario);

/**
 * @route   DELETE /api/scenarios/:id/share/:userId
 * @desc    Remove sharing for a specific user
 * @access  Private
 * @param   {string} id - ID of the scenario
 * @param   {string} userId - ID of the user to remove sharing for
 * @returns {Object} Success message
 */
router.delete('/:id/share/:userId', scenarioShareController.removeShare);

/**
 * @route   GET /api/scenarios/:id/share
 * @desc    Get all users a scenario is shared with
 * @access  Private
 * @param   {string} id - ID of the scenario
 * @returns {Array} Array of user objects
 */
router.get('/:id/share', scenarioShareController.getSharedUsers);

module.exports = router; 