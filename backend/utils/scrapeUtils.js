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
 * Initialize a federal tax data object for a given year
 * @param {number} year - The tax year
 * @returns {Object} An initialized federal tax data object
 */
function initializeFederalTaxData(year) {
    return {
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
}

/**
 * Extract tax brackets from a given table for a specific filing status
 * @param {Object} $ - Cheerio instance
 * @param {Object} table - Table element to extract brackets from
 * @returns {Array} Array of tax bracket objects
 */
function extractTaxBracketsFromTable($, table) {
    const brackets = [];
    
    table.find('tbody tr').each((i, row) => {
        const columns = $(row).find('td');
        if (columns.length === 3) {
            const rate = parseRateToDecimal($(columns[0]).text().trim());
            const lowerBound = parseMoneyToNumber($(columns[1]).text().trim());
            const upperBound = parseMoneyToNumber($(columns[2]).text().trim());

            brackets.push({
                lowerBound,
                upperBound,
                rate
            });
        }
    });
    
    return brackets;
}

/**
 * Scrape income tax brackets from the IRS website
 * @param {Object} federalTaxData - The federal tax data object to update
 * @returns {Promise<Object>} Updated federal tax data with income tax brackets
 */
async function scrapeIncomeTaxBrackets(federalTaxData) {
    console.log('Scraping income tax brackets');
    
    const incomeTaxResponse = await axios.get('https://www.irs.gov/filing/federal-income-tax-rates-and-brackets');
    const $ = cheerio.load(incomeTaxResponse.data);

    // === FIND SINGLE TAXPAYER TABLE ===
    const singleTable = $('h2:contains("single")').nextAll('table').first();
    federalTaxData.single.incomeTaxBrackets = extractTaxBracketsFromTable($, singleTable);
    if (federalTaxData.single.incomeTaxBrackets.length === 0) {
        throw new Error('Failed to extract income tax brackets for single filers');
    }

    // === FIND MARRIED FILING JOINTLY TABLE ===
    // TODO 
    const marriedTable = $('#collapseCollapsible1727890096254_304535 table.table');
    federalTaxData.marriedFilingJointly.incomeTaxBrackets = extractTaxBracketsFromTable($, marriedTable);
    if (federalTaxData.marriedFilingJointly.incomeTaxBrackets.length === 0) {
        throw new Error('Failed to extract income tax brackets for married filing jointly');
    }
    
    return federalTaxData;
}

/**
 * Scrape standard deduction amounts from the IRS website
 * @param {Object} federalTaxData - The federal tax data object to update
 * @returns {Promise<Object>} Updated federal tax data with standard deductions
 */
async function scrapeStandardDeductions(federalTaxData) {
    console.log('Scraping standard deductions');
    
    const standardDeductionResponse = await axios.get('https://www.irs.gov/publications/p17');
    const $ = cheerio.load(standardDeductionResponse.data);
    
    let foundStandardDeductions = false;
    
    // Look for Table 10-1 which contains standard deduction information
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

    if (!foundStandardDeductions || federalTaxData.single.standardDeduction === 0) {
        throw new Error('Failed to extract standard deduction for single filers');
    }

    if (federalTaxData.marriedFilingJointly.standardDeduction === 0) {
        throw new Error('Failed to extract standard deduction for married filing jointly');
    }
    
    return federalTaxData;
}

/**
 * Parse capital gains rates and thresholds from paragraphs and lists
 * @param {Object} $ - Cheerio instance
 * @returns {Object} Object containing rates and thresholds
 */
function parseCapitalGainsRatesAndThresholds($) {
    const rates = [];
    const thresholds = [];
    
    // Find all occurrences of the pattern "A capital gains rate of" and extract rates and thresholds
    $('p').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.includes('A capital gains rate of')) {
            // Extract the rate percentage
            const rateMatch = text.match(/A capital gains rate of\s+(?:<[^>]+>)*\s*(\d+)%\s*(?:<[^>]+>)*/i);
            if (rateMatch && rateMatch[1]) {
                const rate = parseFloat(rateMatch[1]) / 100;
                rates.push(rate);
                
                // Find the following <ul> element that contains thresholds
                const thresholdsList = $(elem).next('ul');
                const thresholdObj = {
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
                            thresholdObj.single.lowerBound = parseMoneyToNumber(matches[1]);
                            thresholdObj.single.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                        }
                    }
                    
                    // Extract married filing jointly thresholds
                    if (itemText.includes('married filing jointly')) {
                        const matches = itemText.match(/\$([0-9,]+)(?:.*?)(?:less than or equal to)?\s+\$?([0-9,]+)?/);
                        if (matches) {
                            thresholdObj.marriedFilingJointly.lowerBound = parseMoneyToNumber(matches[1]);
                            thresholdObj.marriedFilingJointly.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                        }
                    }
                });
                
                thresholds.push(thresholdObj);
            }
        }
    });
    
    return { rates, thresholds };
}

/**
 * Build capital gains brackets for a specific filing status
 * @param {Array} rates - Array of capital gains rates
 * @param {Array} thresholds - Array of threshold objects
 * @param {string} filingStatus - Filing status (single or marriedFilingJointly)
 * @returns {Array} Array of capital gains bracket objects
 */
function buildCapitalGainsBrackets(rates, thresholds, filingStatus) {
    const brackets = [];
    
    for (let i = 0; i < rates.length; i++) {
        if (thresholds[i] && thresholds[i][filingStatus]) {
            brackets.push({
                lowerBound: thresholds[i][filingStatus].lowerBound,
                upperBound: thresholds[i][filingStatus].upperBound,
                rate: rates[i]
            });
        }
    }
    
    // Sort the brackets by lowerBound
    return brackets.sort((a, b) => a.lowerBound - b.lowerBound);
}

/**
 * Scrape capital gains tax brackets from the IRS website
 * @param {Object} federalTaxData - The federal tax data object to update
 * @returns {Promise<Object>} Updated federal tax data with capital gains brackets
 */
async function scrapeCapitalGainsBrackets(federalTaxData) {
    console.log('Scraping capital gains brackets');
    
    const capitalGainsResponse = await axios.get('https://www.irs.gov/taxtopics/tc409');
    const $ = cheerio.load(capitalGainsResponse.data);
    
    const { rates, thresholds } = parseCapitalGainsRatesAndThresholds($);
    
    if (rates.length === 0 || thresholds.length === 0) {
        throw new Error('Failed to extract capital gains rates and thresholds');
    }
    
    // Build capital gains brackets for single filers
    federalTaxData.single.capitalGainsBrackets = buildCapitalGainsBrackets(
        rates, thresholds, 'single'
    );
    
    // Build capital gains brackets for married filing jointly
    federalTaxData.marriedFilingJointly.capitalGainsBrackets = buildCapitalGainsBrackets(
        rates, thresholds, 'marriedFilingJointly'
    );
    
    if (federalTaxData.single.capitalGainsBrackets.length === 0) {
        throw new Error('Failed to build capital gains brackets for single filers');
    }
    
    if (federalTaxData.marriedFilingJointly.capitalGainsBrackets.length === 0) {
        throw new Error('Failed to build capital gains brackets for married filing jointly');
    }
    
    return federalTaxData;
}

/**
 * Scrape federal tax information from IRS websites for the current year
 * @returns {Promise<Object>} The federal tax information
 */
async function scrapeFederalTax() {
    try {
        const year = new Date().getFullYear();
        console.log(`Scraping federal tax information for year ${year}`);

        // Initialize federal tax data object
        let federalTaxData = initializeFederalTaxData(year);
        
        // Scrape income tax brackets
        federalTaxData = await scrapeIncomeTaxBrackets(federalTaxData);
        
        // Scrape standard deductions
        federalTaxData = await scrapeStandardDeductions(federalTaxData);
        
        // Scrape capital gains brackets
        federalTaxData = await scrapeCapitalGainsBrackets(federalTaxData);
        
        // Create and save the federal tax document
        const federalTax = new FederalTax(federalTaxData);

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
 * If not found in database, will attempt to scrape it from IRS website and save to MongoDB.
 * @param {number} year - The year to get tax information for
 * @returns {Promise<Object>} The federal tax information
 */
async function getFederalTax(year = new Date().getFullYear()) {
    try {
        // Try to get from database first
        let federalTax = await FederalTax.findOne({ year });

        if (!federalTax) {
            federalTax = await scrapeFederalTax(); // Scrape federal tax document
            await federalTax.save(); // Save to MongoDB
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