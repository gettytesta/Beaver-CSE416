const FederalTax = require('../models/federalTax');
const RMDTable = require('../models/RMDTable');

/**
 * Try to get state tax information stored in server yamls.
 * @param {string} stateCode - The state to get tax information for, ex: "NY"
 * @returns {Promise<Object>} The state tax information
 */
async function getStateTax(stateCode) {
    try {
        // TODO Implement this function
        // stateCode should be an upper case 2 letter string representing the state name
        // try getting stateCode.yaml
        // if gotten convert it to a StateTax with convertYamlToStateTax in yamlUtils.js
    } catch (error) {
        console.error('Error getting state tax:', error);
        throw error;
    }
}

/**
 * Get federal tax information for a given year
 * If not found in database, will attempt to scrape it from IRS website
 * @param {number} year - The year to get tax information for
 * @returns {Promise<Object>} The federal tax information
 */
async function getFederalTax(year) {
    try {
        // Try to get from database first
        let federalTax = await FederalTax.findOne({ year });
        
        if (!federalTax) {
            // TODO: Implement scraping from IRS website
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
 * Get RMD table for a given year
 * If not found in database, will attempt to scrape it from IRS website
 * @param {number} year - The year to get RMD table for
 * @returns {Promise<Object>} The RMD table
 */
async function getRMDTable(year) {
    try {
        // Try to get from database first
        let rmdTable = await RMDTable.findOne({ year });
        
        if (!rmdTable) {
            // TODO: Implement scraping from IRS website
            // For now, throw an error
            throw new Error(`RMD table not found for year ${year}`);
        }
        
        return rmdTable;
    } catch (error) {
        console.error('Error getting RMD table:', error);
        throw error;
    }
}

module.exports = {
    getStateTax,
    getFederalTax,
    getRMDTable
};