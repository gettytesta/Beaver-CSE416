const yaml = require('js-yaml');
const fs = require('fs');
const StateTax = require('../models/stateTax');

// Placeholder function for YAML to Scenario conversion
function convertYamlToScenario(yamlData, userId) {
    // This function would be implemented later to convert a parsed YAML 
    // object into a proper Scenario object structure

    // TODO: Implement the conversion
    
    return null;
}

// Placeholder function for Scenario to YAML conversion
function convertScenarioToYaml(scenario) {
    // This function would be implemented later to convert a Scenario
    // object into a properly formatted YAML string
    
    // TODO: Implement the conversion
    
    return null;
}

/**
 * Convert YAML file to StateTax object
 * @param {Object} file - The uploaded file object from multer
 * @returns {Promise<Object>} The state tax object
 */
async function convertYamlToStateTax(file) {
    try {
        // Read file content
        const fileContent = fs.readFileSync(file.path, 'utf8');
        
        // Parse YAML
        const parsedYaml = yaml.load(fileContent);
        
        if (!parsedYaml || !parsedYaml.stateCode || !parsedYaml.year || 
            !parsedYaml.single || !parsedYaml.marriedFilingJointly) {
            throw new Error('Invalid state tax YAML structure');
        }
        
        // Create StateTax object
        const stateTax = new StateTax({
            stateCode: parsedYaml.stateCode,
            year: parsedYaml.year,
            single: parsedYaml.single,
            marriedFilingJointly: parsedYaml.marriedFilingJointly
        });
        
        // Remove the uploaded file to prevent clutter
        fs.unlinkSync(file.path);
        
        return stateTax;
    } catch (error) {
        // Clean up the file if an error occurs
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        console.error('Error converting YAML to StateTax:', error);
        throw error;
    }
}

module.exports = {
    convertYamlToScenario,
    convertScenarioToYaml,
    convertYamlToStateTax
}; 