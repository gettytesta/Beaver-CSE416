const express = require('express');
const router = express.Router();
const yamlController = require('../controllers/yamlController');
const { upload } = require('../utils/fileUtils');
const authUtils = require('../utils/authUtils');

// All routes require authentication
router.use(authUtils.authenticateUser);

// Import a scenario YAML file
router.post('/scenario/import', upload.single('yamlFile'), yamlController.importScenarioYaml);

// Export a scenario as YAML
router.get('/scenario/export/:id', yamlController.exportScenarioYaml);

// Import a state tax YAML file
router.post('/statetax/import', upload.single('yamlFile'), yamlController.importStateTaxYaml);

// Get all state tax YAML files for user
router.get('/statetax', yamlController.getStateTaxYamls);

// Delete a state tax YAML file
router.delete('/statetax/:id', yamlController.deleteStateTaxYaml);

module.exports = router; 