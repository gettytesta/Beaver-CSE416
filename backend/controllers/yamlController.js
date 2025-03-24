const fs = require('fs');
const yaml = require('js-yaml');
const StateTaxYaml = require('../models/stateTaxYaml');
const { Scenario } = require('../models/scenario');
const { validateYAMLScenario, validateYAMLStateTax } = require('../utils/validateUtils');

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

        // Validate scenario structure
        if (!validateYAMLScenario(parsedYaml)) {
            // Remove the uploaded file if scenario validation fails
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: 'Invalid scenario YAML structure'
            });
        }

        // Convert YAML to Scenario object
        const scenarioData = convertYamlToScenario(parsedYaml, req.user._id);
        
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
 * Import a state tax YAML file, validate it and save
 */
exports.importStateTaxYaml = async (req, res) => {
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

        // Check if user already has 5 state tax files
        const existingCount = await StateTaxYaml.countDocuments({ userId: req.user._id });
        if (existingCount >= 5) {
            // Remove the uploaded file
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: 'Maximum limit of 5 state tax files reached'
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

        // Validate state tax structure
        if (!validateYAMLStateTax(parsedYaml)) {
            // Remove the uploaded file if state tax validation fails
            fs.unlinkSync(req.file.path);
            
            return res.status(400).json({
                success: false,
                message: 'Invalid state tax YAML structure'
            });
        }

        // Create state tax YAML file
        const stateTaxYaml = new StateTaxYaml({
            name: req.body.name || req.file.originalname,
            stateCode: parsedYaml.stateCode || 'XX', // Extract state code from YAML or use placeholder
            content: fileContent,
            userId: req.user._id
        });
        
        await stateTaxYaml.save();

        // Remove the uploaded file as we've stored the content in the database
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            success: true,
            data: stateTaxYaml
        });
    } catch (error) {
        // Clean up uploaded file in case of error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Error importing state tax YAML',
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

        const scenario = await Scenario.findById(req.params.id);
        
        if (!scenario) {
            return res.status(404).json({
                success: false,
                message: 'Scenario not found'
            });
        }

        // Check if user owns the scenario
        if (scenario.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this scenario'
            });
        }

        // Convert scenario to YAML
        const scenarioYaml = convertScenarioToYaml(scenario);

        res.status(200).json({
            success: true,
            data: {
                name: scenario.name,
                content: scenarioYaml
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error exporting scenario as YAML',
            error: error.message
        });
    }
};

/**
 * List state tax YAML files for user
 */
exports.getStateTaxYamls = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const stateTaxYamls = await StateTaxYaml.find({ userId: req.user._id });
        
        res.status(200).json({
            success: true,
            count: stateTaxYamls.length,
            data: stateTaxYamls
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving state tax YAML files',
            error: error.message
        });
    }
};

/**
 * Delete a state tax YAML file
 */
exports.deleteStateTaxYaml = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        const stateTaxYaml = await StateTaxYaml.findById(req.params.id);
        
        if (!stateTaxYaml) {
            return res.status(404).json({
                success: false,
                message: 'State tax YAML file not found'
            });
        }

        // Check if user owns the file
        if (stateTaxYaml.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this file'
            });
        }

        // Delete the file
        await StateTaxYaml.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'State tax YAML file deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting state tax YAML file',
            error: error.message
        });
    }
};

// Placeholder function for YAML to Scenario conversion
function convertYamlToScenario(yamlData, userId) {
    // This function would be implemented later to convert a parsed YAML 
    // object into a proper Scenario object structure

    // TODO: Implement the conversion
    
    // For now, return a basic structure to allow the code to work
    return {
        name: yamlData.name || 'Imported Scenario',
        userId: userId,
        isMarriedCouple: yamlData.maritalStatus === 'couple',
        userBirthYear: yamlData.birthYears ? yamlData.birthYears[0] : 1990,
        spouseBirthYear: yamlData.birthYears && yamlData.birthYears.length > 1 ? yamlData.birthYears[1] : 1990,
        userLifeExpectancy: { type: 'fixed', value: 85 },
        spouseLifeExpectancy: { type: 'fixed', value: 85 },
        inflationAssumption: { type: 'fixed', value: 0.03 },
        initialLimit: 1000000,
        financialGoal: yamlData.financialGoal || 1000000,
        userStateOfResidence: yamlData.state || 'NY'
    };
}

// Placeholder function for Scenario to YAML conversion
function convertScenarioToYaml(scenario) {
    // This function would be implemented later to convert a Scenario
    // object into a properly formatted YAML string
    
    // TODO: Implement the conversion

    // For now, return a basic YAML structure
    const yamlObj = {
        name: scenario.name,
        maritalStatus: scenario.isMarriedCouple ? 'couple' : 'individual',
        birthYears: [scenario.userBirthYear],
        financialGoal: scenario.financialGoal,
        state: scenario.userStateOfResidence
    };
    
    if (scenario.isMarriedCouple) {
        yamlObj.birthYears.push(scenario.spouseBirthYear);
    }
    
    return yaml.dump(yamlObj);
} 