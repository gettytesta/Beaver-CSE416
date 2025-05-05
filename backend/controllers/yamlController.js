const fs = require('fs');
const yaml = require('js-yaml');
const { Scenario } = require('../models/scenario');
const { convertYamlToScenario, convertScenarioToYaml } = require('../utils/yamlUtils');
const path = require('path');

/**
 * Import a scenario YAML file, validate it and convert to a scenario object
 */
exports.importScenarioYaml = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No YAML file uploaded'
            });
        }

        // Read file content
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        let parsedYaml;

        // Validate YAML syntax
        try {
            parsedYaml = yaml.load(fileContent);
        } catch (error) {
            // Remove the uploaded file if it's not valid YAML
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: 'Invalid YAML file syntax',
                error: error.message
            });
        }

        let scenarioData;

        try {
            scenarioData = await convertYamlToScenario(parsedYaml, req.user._id);
        } catch (error) {
            // Remove the uploaded file if conversion fails
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: 'Invalid scenario YAML structure'
            });
        }
        
        // Create new scenario
        const scenario = new Scenario(scenarioData);
        await scenario.save();

        // Remove the uploaded file as we've processed it
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            data: scenario
        });
    } catch (error) {
        // Clean up uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error importing scenario YAML',
            error: error.message
        });
    }
};

/**
 * Export a scenario as YAML
 */
exports.exportScenarioYaml = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const scenarioId = req.params.id;
        
        // Find the scenario
        const scenario = await Scenario.findById(scenarioId);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        console.log("Scenario.user:", scenario.user, "| req.user._id:", req.user._id);

        
        // Check if user has permission to access this scenario
        if (!scenario.userId || scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Not authorized to access this scenario',
            });
        }
        
        
        // Convert scenario to YAML format using the utility function
        const yamlString = convertScenarioToYaml(scenario);
        
        if (!yamlString) {
            return res.status(500).json({
                success: false,
                message: 'Error converting scenario to YAML'
            });
        }
        
        // Return the YAML as a downloadable file
        res.setHeader('Content-Type', 'text/yaml');
        res.setHeader('Content-Disposition', `attachment; filename="scenario_${scenarioId}.yaml"`);
        res.status(200).send(yamlString);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exporting scenario to YAML',
            error: error.message
        });
    }
};

/**
 * Get list of states that have YAML tax files available
 */
exports.getAvailableStateTaxFiles = async (req, res) => {
    try {
        const yamlsDir = path.join(__dirname, '..', 'yamls');
        const files = fs.readdirSync(yamlsDir);
        
        // Filter for state tax YAML files and extract state codes
        // Files are named with 2 uppercase letters (e.g., NY.yaml)
        const stateTaxFiles = files
            .filter(file => file.match(/^[A-Z]{2}\.yaml$/))
            .map(file => {
                const stateCode = file.substring(0, 2);
                return { stateCode };
            });
        
        // Create an object with state codes
        const statesWithTax = stateTaxFiles.reduce((acc, { stateCode }) => {
            if (!acc[stateCode]) {
                acc[stateCode] = true;
            }
            return acc;
        }, {});
        
        res.status(200).json({
            success: true,
            data: Object.keys(statesWithTax)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting available state tax files',
            error: error.message
        });
    }
};

//Upload StateTaxYAML
/**
 * Upload a state tax YAML file and validate its contents
 */
exports.uploadStateTaxYaml = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No YAML file uploaded' });
        }

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        let parsedYaml;

        try {
            parsedYaml = yaml.load(fileContent);
        } catch (err) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Invalid YAML syntax',
                error: err.message,
            });
        }

        const yamlStateCode = parsedYaml?.stateCode?.toUpperCase?.();
        const selectedStateCode = req.body.selectedStateCode?.toUpperCase?.();

        if (!yamlStateCode || !/^[A-Z]{2}$/.test(yamlStateCode)) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'YAML file must contain a valid 2-letter stateCode',
            });
        }

        //Check match
        if (yamlStateCode !== selectedStateCode) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: `Mismatch: YAML is for ${yamlStateCode}, but you selected ${selectedStateCode}.`,
            });
        }

        const targetPath = path.join(__dirname, '..', 'yamls', `${yamlStateCode}.yaml`);
        fs.renameSync(req.file.path, targetPath);

        return res.status(200).json({
            success: true,
            message: `YAML file for ${yamlStateCode} uploaded successfully.`,
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: 'Error uploading YAML file',
            error: err.message,
        });
    }
};

  
