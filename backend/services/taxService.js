const path = require('path');
const FederalTax = require('../models/federalTax');
const RMDTable = require('../models/rmdTable');
const { scrapeFederalTax, scrapeRMDTable } = require('../utils/scrapeUtils');
const { convertYamlToStateTax } = require('../utils/yamlUtils');

// Updates federal tax and rmd table for the current year if necessary 
exports.updateData = async () => {
    try {
        const currentYear = new Date().getFullYear();
        console.log(`Searching for federal tax and RMD table data for current year ${currentYear}.`);

        let federalTax = await FederalTax.findOne({ year: currentYear });
        if (!federalTax) {
            console.log(`No federal tax data found, scraping data...`);
            federalTax = await scrapeFederalTax(
                process.env.SCRAPE_INCOME_TAX_BRACKETS_URL,
                process.env.SCRAPE_STANDARD_DEDUCTIONS_URL,
                process.env.SCRAPE_CAPITAL_GAINS_URL,
            );
            await federalTax.save();
            console.log(`Successfully saved tax data to database!`);
        } else {
            console.log(`✓ Found federal tax data.`);
        }

        let rmdTable = await RMDTable.findOne({ year: currentYear });
        if (!rmdTable) {
            console.log(`No RMD table found, scraping data...`);
            rmdTable = await scrapeRMDTable(process.env.SCRAPE_RMD_TABLE_URL);
            await rmdTable.save();
            console.log(`Successfully saved RMD table to database!`);
        } else {
            console.log(`✓ Found RMD table.`);
        }
    } catch (error) {
        console.log(`Error updating federal tax and RMD table data: ${error}`);
    }
};

// Get federal tax data for the current year, if none found update data.
exports.getFederalTax = async () => {
    try {
        const currentYear = new Date().getFullYear();
        let federalTax = await FederalTax.findOne({ currentYear });
        if (!federalTax) {
            console.log(`Federal tax data not found for current year ${currentYear}, restart the server to update.`);
        }
        return federalTax;
    } catch (error) {
        console.log(`Error getting federal tax data: ${error}`);
        return null;
    }
};

// Get state tax data for a specific state ("NY", "PA", etc) from the yamls folder.
exports.getStateTax = async (stateName) => {
    try {
        const normalizedStateName = stateName.substring(0, 2).toUpperCase(); // Normalize state name just in case
        const yamlPath = path.join(__dirname, '..', 'yamls', `${normalizedStateName}.yaml`); // Look for YAML file
        stateTax = await convertYamlToStateTax(yamlPath) // Create StateTax object
        return stateTax;
    } catch (error) {
        console.log(`Error getting state tax data: ${error}`);
        return null;
    }
};

// Get RMD table data for the current year from the database, if none found update data.
exports.getRMDTable = async () => {
    try {
        const currentYear = new Date().getFullYear();
        let rmdTable = await RMDTable.findOne({ currentYear });
        if (!rmdTable) {
            console.log(`RMD table not found for current year ${currentYear}, restart the server to update.`);
        }
        return rmdTable;
    } catch (error) {
        console.log(`Error getting RMD table data: ${error}`);
        return null;
    }
};