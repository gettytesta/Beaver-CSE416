const FederalTax = require('../models/federalTax');
const RMDTable = require('../models/rmdTable');
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
 * @param {String} url - The url to scrape from.
 * @returns {Promise<Object>} Updated federal tax data with income tax brackets
 */
async function scrapeIncomeTaxBrackets(federalTaxData, url) {
    console.log('Scraping income tax brackets');
    
    const incomeTaxResponse = await axios.get(url);
    const $ = cheerio.load(incomeTaxResponse.data);

    // === FIND SINGLE TAXPAYER TABLE ===
    const singleTable = $('h2:contains("single")').nextAll('table').first();
    federalTaxData.single.incomeTaxBrackets = extractTaxBracketsFromTable($, singleTable);
    if (federalTaxData.single.incomeTaxBrackets.length === 0) {
        throw new Error('Failed to extract income tax brackets for single filers');
    }

    // === FIND MARRIED FILING JOINTLY TABLE ===
    const marriedTable = $('h4:contains("Married filing jointly")').closest('.collapsible-item').find('table');
    federalTaxData.marriedFilingJointly.incomeTaxBrackets = extractTaxBracketsFromTable($, marriedTable);
    if (federalTaxData.marriedFilingJointly.incomeTaxBrackets.length === 0) {
        throw new Error('Failed to extract income tax brackets for married filing jointly');
    }
    
    return federalTaxData;
}

/**
 * Scrape standard deduction amounts from the IRS website
 * @param {Object} federalTaxData - The federal tax data object to update
 * @param {String} url - The url to scrape from.
 * @returns {Promise<Object>} Updated federal tax data with standard deductions
 */
async function scrapeStandardDeductions(federalTaxData, url) {
    console.log('Scraping standard deductions');
    
    const standardDeductionResponse = await axios.get(url);
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
    
    // Find all occurrences of the pattern "a capital gains rate of" and extract rates and thresholds
    $('p').each((i, elem) => {
        const text = $(elem).text().trim().toLowerCase();
        if (text.includes('a capital gains rate of')) {
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
                        const matches = itemText.match(/\$([\d,]+)(?:.*?\$([\d,]+))?/);
                        if (matches) {
                            if (rate === 0.0) {
                                thresholdObj.single.lowerBound = 0.0;
                                thresholdObj.single.upperBound = parseMoneyToNumber(matches[1]);
                            } else {
                                thresholdObj.single.lowerBound = parseMoneyToNumber(matches[1]);
                                thresholdObj.single.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                            }
                        }
                    }
                    
                    // Extract married filing jointly thresholds
                    if (itemText.includes('married filing jointly')) {
                        const matches = itemText.match(/\$([\d,]+)(?:.*?\$([\d,]+))?/);
                        if (matches) {
                            if (rate === 0.0) {
                                thresholdObj.marriedFilingJointly.lowerBound = 0.0;
                                thresholdObj.marriedFilingJointly.upperBound = parseMoneyToNumber(matches[1]);
                            } else {
                                thresholdObj.marriedFilingJointly.lowerBound = parseMoneyToNumber(matches[1]);
                                thresholdObj.marriedFilingJointly.upperBound = matches[2] ? parseMoneyToNumber(matches[2]) : Infinity;
                            }
                        }
                    }
                });

                if (thresholdsList.length === 0) {
                    // Special case: the last rate, we need to set the bounds based on the previous threshold.
                    if (rate > 0.0) {
                        // lowerBound should be the previous rate's upperBound
                        thresholdObj.single.lowerBound = thresholds[thresholds.length - 1].single.upperBound;
                        thresholdObj.single.upperBound = Infinity;
                        thresholdObj.marriedFilingJointly.lowerBound = thresholds[thresholds.length - 1].marriedFilingJointly.upperBound;
                        thresholdObj.marriedFilingJointly.upperBound = Infinity;
                    }
                }
                
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
 * @param {String} url - The url to scrape from.
 * @returns {Promise<Object>} Updated federal tax data with capital gains brackets
 */
async function scrapeCapitalGainsBrackets(federalTaxData, url) {
    console.log('Scraping capital gains brackets');
    const capitalGainsResponse = await axios.get(url);
    const $ = cheerio.load(capitalGainsResponse.data);
    const { rates, thresholds } = parseCapitalGainsRatesAndThresholds($);
    
    if (rates.length === 0 || thresholds.length === 0) {
        throw new Error('Failed to extract capital gains rates and thresholds');
    }
    
    federalTaxData.single.capitalGainsBrackets = buildCapitalGainsBrackets(rates, thresholds, 'single');
    federalTaxData.marriedFilingJointly.capitalGainsBrackets = buildCapitalGainsBrackets(rates, thresholds, 'marriedFilingJointly');
    
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
exports.scrapeFederalTax = async (incomeTaxUrl, standardDeductionsUrl, capitalGainsUrl) => {
    try {
        const currentYear = new Date().getFullYear();
        console.log(`Scraping federal tax information for year ${currentYear}`);

        let federalTaxData = initializeFederalTaxData(currentYear); // Initialize federal tax data object
        federalTaxData = await scrapeIncomeTaxBrackets(federalTaxData, incomeTaxUrl); // Scrape income tax brackets
        federalTaxData = await scrapeStandardDeductions(federalTaxData, standardDeductionsUrl); // Scrape standard deductions
        federalTaxData = await scrapeCapitalGainsBrackets(federalTaxData, capitalGainsUrl); // Scrape capital gains brackets
        const federalTax = new FederalTax(federalTaxData);  // Create the federal tax document

        console.log(`Successfully scraped federal tax information for year ${currentYear}`);
        return federalTax;
    } catch (error) {
        console.error('Error scraping federal tax information:', error);
        throw error;
    }
}

/**
 * Scrape RMD table information from IRS publications
 * @param {String} url The url to scrape the RMD from.
 * @returns {Promise<Object>} The RMD table object
 */
exports.scrapeRMDTable = async (url) => {
    try {
        const currentYear = new Date().getFullYear();
        console.log(`Scraping RMD table for year ${currentYear}`);

        // Initialize RMD table data with the current year
        const rmdTableData = {
            year: currentYear,
            distributionPeriods: new Map()
        };

        // Scrape RMD table from IRS publication 590-B
        const rmdResponse = await axios.get(url);
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

        // Create the RMD table document
        const rmdTable = new RMDTable(rmdTableData);

        console.log(`Successfully scraped RMD table for year ${currentYear}`);
        return rmdTable;
    } catch (error) {
        console.error('Error scraping RMD table:', error);
        throw error;
    }
}
