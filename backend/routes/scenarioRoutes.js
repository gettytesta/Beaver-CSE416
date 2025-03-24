const express = require('express');
const router = express.Router();
const scenarioController = require('../controllers/scenarioController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all scenarios for user (owned and shared)
router.get('/', scenarioController.getScenarios);

// Get single scenario by ID
router.get('/:id', scenarioController.getScenario);

// Create a new scenario
router.post('/', scenarioController.createScenario);

// Update a scenario
router.put('/:id', scenarioController.updateScenario);

// Delete a scenario
router.delete('/:id', scenarioController.deleteScenario);

// Share a scenario with another user
router.post('/:id/share', scenarioController.shareScenario);

// Remove sharing for a user
router.delete('/:id/share/:userId', scenarioController.removeShare);

// Get all users a scenario is shared with
router.get('/:id/share', scenarioController.getSharedUsers);

module.exports = router; 