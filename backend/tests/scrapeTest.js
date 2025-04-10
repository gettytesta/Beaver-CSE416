/**
 * Manual test script for federal tax scraping
 * 
 * Usage: 
 *   node tests/scrapeTest.js
 *   you can also execute: npm run scrape
 * 
 * This script tests the scraping functionality directly without running full Jest tests.
 * It helps diagnose specific issues with scraping the IRS website.
 */

require('dotenv').config();
const scrapeUtils = require('../utils/scrapeUtils');

// Helper to display the scraped data
function displayTaxInfo(taxInfo) {
    console.log('\n========== FEDERAL TAX INFO ==========\n');
    console.log(`Year: ${taxInfo.year}`);
    
    console.log('\n---------- SINGLE FILING STATUS ----------');
    console.log(`Standard Deduction: $${taxInfo.single.standardDeduction.toLocaleString()}`);
    
    console.log('\nIncome Tax Brackets:');
    taxInfo.single.incomeTaxBrackets.forEach(bracket => {
        const upperBound = bracket.upperBound === Infinity 
            ? 'and up' 
            : `to $${bracket.upperBound.toLocaleString()}`;
        console.log(`  ${(bracket.rate * 100).toFixed(1)}%: $${bracket.lowerBound.toLocaleString()} ${upperBound}`);
    });
    
    console.log('\nCapital Gains Brackets:');
    taxInfo.single.capitalGainsBrackets.forEach(bracket => {
        const upperBound = bracket.upperBound === Infinity 
            ? 'and up' 
            : `to $${bracket.upperBound.toLocaleString()}`;
        console.log(`  ${(bracket.rate * 100).toFixed(1)}%: $${bracket.lowerBound.toLocaleString()} ${upperBound}`);
    });
    
    console.log('\n---------- MARRIED FILING JOINTLY ----------');
    console.log(`Standard Deduction: $${taxInfo.marriedFilingJointly.standardDeduction.toLocaleString()}`);
    
    console.log('\nIncome Tax Brackets:');
    taxInfo.marriedFilingJointly.incomeTaxBrackets.forEach(bracket => {
        const upperBound = bracket.upperBound === Infinity 
            ? 'and up' 
            : `to $${bracket.upperBound.toLocaleString()}`;
        console.log(`  ${(bracket.rate * 100).toFixed(1)}%: $${bracket.lowerBound.toLocaleString()} ${upperBound}`);
    });
    
    console.log('\nCapital Gains Brackets:');
    taxInfo.marriedFilingJointly.capitalGainsBrackets.forEach(bracket => {
        const upperBound = bracket.upperBound === Infinity 
            ? 'and up' 
            : `to $${bracket.upperBound.toLocaleString()}`;
        console.log(`  ${(bracket.rate * 100).toFixed(1)}%: $${bracket.lowerBound.toLocaleString()} ${upperBound}`);
    });
    
    console.log('\n=======================================\n');
}

// Helper to display the RMD table data
function displayRMDTable(rmdTable) {
    console.log('\n========== RMD TABLE INFO ==========\n');
    console.log(`Year: ${rmdTable.year}`);
    
    console.log('\nDistribution Periods:');
    // Convert Map to array of entries and sort by age
    const sortedEntries = Array.from(rmdTable.distributionPeriods.entries())
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    
    // Display in a table format
    console.log('Age | Distribution Period');
    console.log('----|-------------------');
    sortedEntries.forEach(([age, period]) => {
        console.log(`${age.padEnd(4)}| ${period.toFixed(2)}`);
    });
    
    console.log('\n=======================================\n');
}

async function testScraping() {
    try {
        const federalTax = await scrapeUtils.scrapeFederalTax(
            process.env.SCRAPE_INCOME_TAX_BRACKETS_URL,
            process.env.SCRAPE_STANDARD_DEDUCTIONS_URL,
            process.env.SCRAPE_CAPITAL_GAINS_URL,
        );
        displayTaxInfo(federalTax); // Display the federal tax results

        const rmdTable = await scrapeUtils.scrapeRMDTable(process.env.SCRAPE_RMD_TABLE_URL);
        displayRMDTable(rmdTable); // Display the RMD table results
        
    } catch (error) {
        console.error('Error during scraping test:', error);
    } finally {
        console.log('Finished scrape test.');
    }
}

testScraping(); 