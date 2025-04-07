const FederalTax = require('../models/federalTax');
const RMDTable = require('../models/RMDTable');
const { convertYamlToStateTax } = require('./yamlUtils');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Parse a money string to a number
 * @param {string} moneyStr - String with money format like "$11,600"
 * @returns {number} The parsed number value
 */
function parseMoneyToNumber(moneyStr) {
    if (!moneyStr) return 0;

    // If the string is "And up" or similar, return Infinity
    if (moneyStr.toLowerCase().includes('up')) {
        return Infinity;
    }

    // Remove $ sign, commas, and convert to number
    return parseFloat(moneyStr.replace(/[$,]/g, ''));
}

/**
 * Parse tax rate string to decimal
 * @param {string} rateStr - String with percentage format like "10%"
 * @returns {number} The parsed decimal rate (e.g., 0.10)
 */
function parseRateToDecimal(rateStr) {
    if (!rateStr) return 0;

    // Remove % sign and convert to decimal
    return parseFloat(rateStr.replace('%', '')) / 100;
}

/**
 * Scrape federal tax information from IRS websites
 * @param {number} year - The year to scrape tax information for (defaults to current year)
 * @returns {Promise<Object>} The federal tax information
 */
async function scrapeFederalTax(year = new Date().getFullYear()) {
    try {
        console.log(`Scraping federal tax information for year ${year}`);

        // Initialize federal tax object with the year
        const federalTaxData = {
            year,
            single: {
                standardDeduction: 0,
                incomeTaxBrackets: [],
                capitalGainsBrackets: []
            },
            marriedFilingJointly: {
                standardDeduction: 0,
                incomeTaxBrackets: [],
                capitalGainsBrackets: []
            }
        };

        // Scrape income tax rates and brackets from IRS website
        // URL: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
        const incomeTaxResponse = await axios.get('https://www.irs.gov/filing/federal-income-tax-rates-and-brackets');
        let $ = cheerio.load(incomeTaxResponse.data);

        // === FIND SINGLE TAXPAYER TABLE ===
        // Locate the table that follows an <h2> containing "single taxpayer"
        const singleTable = $('h2:contains("single")')
            .nextAll('table').first();

        singleTable.find('tbody tr').each((i, row) => {
            const columns = $(row).find('td');
            if (columns.length === 3) {
                const rate = parseRateToDecimal($(columns[0]).text().trim());
                const lowerBound = parseMoneyToNumber($(columns[1]).text().trim());
                const upperBound = parseMoneyToNumber($(columns[2]).text().trim());

                federalTaxData.single.incomeTaxBrackets.push({
                    lowerBound,
                    upperBound,
                    rate
                });
            }
        });

        // === FIND MARRIED FILING JOINTLY TABLE ===
        // Locate the table inside the collapsible div following the correct <h4>
        const marriedTable = $('h4 a:contains("Married filing jointly")')
            .closest('h4')
            .nextAll('.collapsible-item-collapse')
            .find('table').first();

        marriedTable.find('tbody tr').each((i, row) => {
            const columns = $(row).find('td');
            if (columns.length === 3) {
                const rate = parseRateToDecimal($(columns[0]).text().trim());
                const lowerBound = parseMoneyToNumber($(columns[1]).text().trim());
                const upperBound = parseMoneyToNumber($(columns[2]).text().trim());

                federalTaxData.marriedFilingJointly.incomeTaxBrackets.push({
                    lowerBound,
                    upperBound,
                    rate
                });
            }
        });

        // Fallback to hardcoded values if we couldn't parse the tables
        if (federalTaxData.single.incomeTaxBrackets.length === 0) {
            console.warn('Could not parse single tax brackets, using fallback values');
            federalTaxData.single.incomeTaxBrackets = [
                { lowerBound: 0, upperBound: 11600, rate: 0.10 },
                { lowerBound: 11601, upperBound: 47150, rate: 0.12 },
                { lowerBound: 47151, upperBound: 100525, rate: 0.22 },
                { lowerBound: 100526, upperBound: 191950, rate: 0.24 },
                { lowerBound: 191951, upperBound: 243725, rate: 0.32 },
                { lowerBound: 243726, upperBound: 609350, rate: 0.35 },
                { lowerBound: 609351, upperBound: Infinity, rate: 0.37 }
            ];
        }

        // Fallback to hardcoded values if we couldn't parse the tables
        if (federalTaxData.marriedFilingJointly.incomeTaxBrackets.length === 0) {
            console.warn('Could not parse married filing jointly tax brackets, using fallback values');
            federalTaxData.marriedFilingJointly.incomeTaxBrackets = [
                { lowerBound: 0, upperBound: 23200, rate: 0.10 },
                { lowerBound: 23201, upperBound: 94300, rate: 0.12 },
                { lowerBound: 94301, upperBound: 201050, rate: 0.22 },
                { lowerBound: 201051, upperBound: 383900, rate: 0.24 },
                { lowerBound: 383901, upperBound: 487450, rate: 0.32 },
                { lowerBound: 487451, upperBound: 731200, rate: 0.35 },
                { lowerBound: 731201, upperBound: Infinity, rate: 0.37 }
            ];
        }

        // Scrape standard deduction from IRS publication 17
        // URL: https://www.irs.gov/publications/p17
        const standardDeductionResponse = await axios.get('https://www.irs.gov/publications/p17');
        $ = cheerio.load(standardDeductionResponse.data);

        // === FIND STANDARD DEDUCTION TABLE ===
        // Look for Table 10-1 which contains standard deduction information
        let foundStandardDeductions = false;
        
        // Look for the table title and get the following table
        $('p.title:contains("Table 10-1")').each((i, elem) => {
            // Find the table that's inside the div.table-contents after this title
            const table = $(elem).next('div.table-contents').find('table');
            
            if (table.length > 0) {
                console.log('Found standard deduction Table 10-1');
                
                // Process each row in the table
                table.find('tbody tr').each((j, row) => {
                    const columns = $(row).find('td');
                    
                    if (columns.length >= 2) {
                        const filingStatus = $(columns[0]).text().trim();
                        const deductionAmount = $(columns[1]).text().trim();
                        
                        // Check for Single filing status
                        if (filingStatus.includes('Single')) {
                            federalTaxData.single.standardDeduction = parseMoneyToNumber(deductionAmount);
                            foundStandardDeductions = true;
                        }
                        
                        // Check for Married filing jointly
                        if (filingStatus.includes('Married filing jointly')) {
                            federalTaxData.marriedFilingJointly.standardDeduction = parseMoneyToNumber(deductionAmount);
                            foundStandardDeductions = true;
                        }
                    }
                });
            }
        });

        // Fallback standard deduction values
        if (federalTaxData.single.standardDeduction === 0) {
            console.warn('Could not parse single standard deduction, using fallback value');
            federalTaxData.single.standardDeduction = 14600;
        }

        if (federalTaxData.marriedFilingJointly.standardDeduction === 0) {
            console.warn('Could not parse married filing jointly standard deduction, using fallback value');
            federalTaxData.marriedFilingJointly.standardDeduction = 29200;
        }

        // Scrape capital gains tax rates from IRS website
        // URL: https://www.irs.gov/taxtopics/tc409
        const capitalGainsResponse = await axios.get('https://www.irs.gov/taxtopics/tc409');
        $ = cheerio.load(capitalGainsResponse.data);

        // Try to parse capital gains brackets from the page
        // Look for the text patterns "A capital gains rate of X%" to find the brackets
        const capitalGainsRates = [];
        const capitalGainsThresholds = [];

        // Find all occurrences of the pattern "A capital gains rate of" and extract rates and thresholds
        $('p').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text.includes('A capital gains rate of')) {
                // Extract the rate percentage
                const rateMatch = text.match(/A capital gains rate of\s+(?:<[^>]+>)*\s*(\d+)%\s*(?:<[^>]+>)*/i);
                if (rateMatch && rateMatch[1]) {
                    const rate = parseFloat(rateMatch[1]) / 100;
                    capitalGainsRates.push(rate);
                    
                    // Find the following <ul> element that contains thresholds
                    const thresholdsList = $(elem).next('ul');
                    const thresholds = {
                        single: { lowerBound: 0, upperBound: 0 },
                        marriedFilingJointly: { lowerBound: 0, upperBound: 0 }
                    };
                    
                    // Extract thresholds for different filing statuses
                    thresholdsList.find('li').each((j, item) => {
                        const itemText = $(item).text().trim();
                        
                        // Extract single filer thresholds
                        if (itemText.includes('single')) {
                            const matches = itemText.match(/\$([0-9,]+)(?:.*?)(?:less than or equal to)?\s+\$?([0-9,]+)?/);
                            if (matches) {
                                thresholds.single.lowerBound = parseMoneyToNumber(matches[1]);
                                thresholds.single.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                            }
                        }
                        
                        // Extract married filing jointly thresholds
                        if (itemText.includes('married filing jointly')) {
                            const matches = itemText.match(/\$([0-9,]+)(?:.*?)(?:less than or equal to)?\s+\$?([0-9,]+)?/);
                            if (matches) {
                                thresholds.marriedFilingJointly.lowerBound = parseMoneyToNumber(matches[1]);
                                thresholds.marriedFilingJointly.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                            }
                        }
                    });
                    
                    capitalGainsThresholds.push(thresholds);
                }
            }
        });

        // Build capital gains brackets for single filers
        federalTaxData.single.capitalGainsBrackets = [];
        for (let i = 0; i < capitalGainsRates.length; i++) {
            if (capitalGainsThresholds[i] && capitalGainsThresholds[i].single) {
                federalTaxData.single.capitalGainsBrackets.push({
                    lowerBound: capitalGainsThresholds[i].single.lowerBound,
                    upperBound: capitalGainsThresholds[i].single.upperBound,
                    rate: capitalGainsRates[i]
                });
            }
        }

        // Build capital gains brackets for married filing jointly
        federalTaxData.marriedFilingJointly.capitalGainsBrackets = [];
        for (let i = 0; i < capitalGainsRates.length; i++) {
            if (capitalGainsThresholds[i] && capitalGainsThresholds[i].marriedFilingJointly) {
                federalTaxData.marriedFilingJointly.capitalGainsBrackets.push({
                    lowerBound: capitalGainsThresholds[i].marriedFilingJointly.lowerBound,
                    upperBound: capitalGainsThresholds[i].marriedFilingJointly.upperBound,
                    rate: capitalGainsRates[i]
                });
            }
        }

        // Sort the brackets by lowerBound
        federalTaxData.single.capitalGainsBrackets.sort((a, b) => a.lowerBound - b.lowerBound);
        federalTaxData.marriedFilingJointly.capitalGainsBrackets.sort((a, b) => a.lowerBound - b.lowerBound);

        // Fallback values for capital gains taxes if scraping failed
        if (federalTaxData.single.capitalGainsBrackets.length === 0) {
            console.warn('Could not parse single capital gains brackets, using fallback values');
            federalTaxData.single.capitalGainsBrackets = [
                { lowerBound: 0, upperBound: 44625, rate: 0.0 },
                { lowerBound: 44626, upperBound: 492300, rate: 0.15 },
                { lowerBound: 492301, upperBound: Infinity, rate: 0.20 }
            ];
        }

        // Fallback values for capital gains taxes
        if (federalTaxData.marriedFilingJointly.capitalGainsBrackets.length === 0) {
            console.warn('Could not parse married filing jointly capital gains brackets, using fallback values');
            federalTaxData.marriedFilingJointly.capitalGainsBrackets = [
                { lowerBound: 0, upperBound: 89250, rate: 0.0 },
                { lowerBound: 89251, upperBound: 553850, rate: 0.15 },
                { lowerBound: 553851, upperBound: Infinity, rate: 0.20 }
            ];
        }

        // Create and save the federal tax document
        const federalTax = new FederalTax(federalTaxData);
        await federalTax.save();

        console.log(`Successfully saved federal tax information for year ${year}`);
        return federalTax;
    } catch (error) {
        console.error('Error scraping federal tax information:', error);
        throw error;
    }
}

/**
 * Scrape RMD table information from IRS publications
 * @param {number} year - The year to scrape RMD table for (defaults to current year)
 * @returns {Promise<Object>} The RMD table object
 */
async function scrapeRMDTable(year = new Date().getFullYear()) {
    try {
        console.log(`Scraping RMD table for year ${year}`);

        // Initialize RMD table data with the year
        const rmdTableData = {
            year,
            distributionPeriods: new Map()
        };

        // Scrape RMD table from IRS publication 590-B
        // URL: https://www.irs.gov/publications/p590b
        const rmdResponse = await axios.get('https://www.irs.gov/publications/p590b');
        const $ = cheerio.load(rmdResponse.data);

        // Find the Uniform Lifetime Table
        const uniformLifetimeTable = $('p.title:contains("Uniform Lifetime Table")')
            .closest('div.table')
            .find('table');

        if (uniformLifetimeTable.length === 0) {
            throw new Error('Could not find Uniform Lifetime Table in IRS publication');
        }

        console.log('Found Uniform Lifetime Table');

        // Process the table rows to extract age and distribution period data
        uniformLifetimeTable.find('tr').each((i, row) => {
            const columns = $(row).find('td');
            
            // Skip header rows and empty rows
            if (columns.length < 2) return;

            // Process left pair (age and distribution period)
            const leftAge = $(columns[0]).text().trim();
            const leftDistPeriod = $(columns[1]).text().trim();
            
            // Process right pair if exists (age and distribution period)
            const rightAge = columns.length >= 4 ? $(columns[2]).text().trim() : '';
            const rightDistPeriod = columns.length >= 4 ? $(columns[3]).text().trim() : '';
            
            // Parse and add left pair if it contains valid numeric data
            if (leftAge && leftDistPeriod && !isNaN(parseInt(leftAge))) {
                const age = parseInt(leftAge);
                // Handle special case for "120 and over"
                if (leftAge.includes('and over')) {
                    rmdTableData.distributionPeriods.set('120', parseFloat(leftDistPeriod));
                } else {
                    rmdTableData.distributionPeriods.set(age.toString(), parseFloat(leftDistPeriod));
                }
            }
            
            // Parse and add right pair if it contains valid numeric data
            if (rightAge && rightDistPeriod && !isNaN(parseInt(rightAge))) {
                const age = parseInt(rightAge);
                // Handle special case for "120 and over"
                if (rightAge.includes('and over')) {
                    rmdTableData.distributionPeriods.set('120', parseFloat(rightDistPeriod));
                } else {
                    rmdTableData.distributionPeriods.set(age.toString(), parseFloat(rightDistPeriod));
                }
            }
        });

        // Verify we extracted data
        if (rmdTableData.distributionPeriods.size === 0) {
            throw new Error('Failed to extract distribution periods from RMD table');
        }

        console.log(`Successfully extracted ${rmdTableData.distributionPeriods.size} distribution periods`);

        // Create and save the RMD table document
        const rmdTable = new RMDTable(rmdTableData);
        await rmdTable.save();

        console.log(`Successfully saved RMD table for year ${year}`);
        return rmdTable;
    } catch (error) {
        console.error('Error scraping RMD table:', error);
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
            // Scrape from IRS website if not found in database
            rmdTable = await scrapeRMDTable(year);
        }

        return rmdTable;
    } catch (error) {
        console.error('Error getting RMD table:', error);
        throw error;
    }
}

/**
 * Try to get state tax information stored in server yamls.
 * @param {string} stateCode - The state to get tax information for, ex: "NY"
 * @returns {Promise<Object>} The state tax information
 */
async function getStateTax(stateCode) {
    try {
        // stateCode should be an upper case 2 letter string representing the state name
        const fs = require('fs');
        const path = require('path');
        const yaml = require('js-yaml');
        
        // Ensure stateCode is uppercase
        const formattedStateCode = stateCode.toUpperCase();
        
        // Build the path to the YAML file
        const yamlPath = path.join(__dirname, '..', 'yamls', `${formattedStateCode}.yaml`);
        
        // Check if the file exists
        if (!fs.existsSync(yamlPath)) {
            throw new Error(`State tax file for ${formattedStateCode} not found`);
        }
        
        // Read and parse the YAML file
        const fileContent = fs.readFileSync(yamlPath, 'utf8');
        const parsedYaml = yaml.load(fileContent);
        
        // Create a file-like object to match the expected input for convertYamlToStateTax
        const fileObj = {
            path: yamlPath,
            buffer: Buffer.from(fileContent)
        };
        
        // Convert YAML to StateTax object
        const stateTax = await convertYamlToStateTax(fileObj);
        
        return stateTax;
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
            federalTax = await scrapeFederalTax(year);
        }

        return federalTax;
    } catch (error) {
        console.error('Error getting federal tax:', error);
        throw error;
    }
}

module.exports = {
    getStateTax,
    getFederalTax,
    getRMDTable,
    scrapeRMDTable,
    scrapeFederalTax
};