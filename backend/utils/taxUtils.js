const FederalTax = require('../models/federalTax');
const StateTax = require('../models/stateTax');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Get federal tax information for a given year
 * If not found in database, will attempt to scrape it
 * @param {number} year - The year to get tax information for
 * @returns {Promise<Object>} The federal tax information
 */
async function getFederalTax(year) {
    try {
        // Try to get from database first
        let federalTax = await FederalTax.findOne({ year });
        
        if (!federalTax) {
            // TODO: Implement scraping logic here
            // For now, throw an error
            throw new Error(`Federal tax data not found for year ${year}`);
        }
        
        return federalTax;
    } catch (error) {
        console.error('Error getting federal tax:', error);
        throw error;
    }
}

/**
 * Process state tax YAML data
 * @param {string} stateCode - The two-letter state code
 * @param {number} year - The year of the tax data
 * @param {string|Object} yamlData - The YAML data as string or parsed object
 * @returns {Promise<Object>} The processed state tax data
 */
async function processStateTaxYaml(stateCode, year, yamlData) {
    try {
        // Parse YAML if it's a string
        const parsedYaml = typeof yamlData === 'string' ? yaml.load(yamlData) : yamlData;
        
        // Create new StateTax object
        const stateTax = new StateTax({
            stateCode,
            year,
            single: parsedYaml.single,
            marriedFilingJointly: parsedYaml.marriedFilingJointly
        });
        
        // Save to database for future use
        await stateTax.save();
        
        return stateTax;
    } catch (error) {
        console.error('Error processing state tax YAML:', error);
        throw error;
    }
}

/**
 * Get state tax information for a given state and year
 * If not found in database, will look for a YAML file in the yamls folder
 * @param {string} stateCode - The two-letter state code
 * @param {number} year - The year to get tax information for
 * @param {string|Object} [uploadedYaml] - Optional uploaded YAML data
 * @returns {Promise<Object|null>} The state tax information
 */
async function getStateTax(stateCode, year, uploadedYaml = null) {
    try {
        // Try to get from database first
        let stateTax = await StateTax.findOne({ stateCode, year });
        
        if (!stateTax) {
            if (uploadedYaml) {
                // Process uploaded YAML data
                stateTax = await processStateTaxYaml(stateCode, year, uploadedYaml);
            } else {
                // Look for YAML file in yamls folder
                const yamlPath = path.join(__dirname, '..', 'yamls', `${stateCode.toLowerCase()}_tax_${year}.yaml`);
                
                if (fs.existsSync(yamlPath)) {
                    const fileContent = fs.readFileSync(yamlPath, 'utf8');
                    stateTax = await processStateTaxYaml(stateCode, year, fileContent);
                } else {
                    // If no YAML file found, return null to indicate no state tax data
                    return null;
                }
            }
        }
        
        return stateTax;
    } catch (error) {
        console.error('Error getting state tax:', error);
        throw error;
    }
}

module.exports = {
    getFederalTax,
    getStateTax,
    processStateTaxYaml
}; 