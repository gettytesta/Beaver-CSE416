/**
 * Manual test script for federal tax scraping
 * 
 * Usage: 
 *   node tests/scrapeTest.js
 * 
 * This script tests the scraping functionality directly without running full Jest tests.
 * It helps diagnose specific issues with scraping the IRS website.
 */

// Set up MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');
const { scrapeFederalTax, getFederalTax } = require('../utils/scrapeUtils');

// Connect to MongoDB
async function connectToDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

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

// Main function to test scraping
async function testScraping() {
    try {
        await connectToDatabase();
        
        // Test option 1: Try to get existing data
        console.log('Attempting to get federal tax data from database...');
        const year = new Date().getFullYear();
        let taxInfo = await getFederalTax(year);
        
        if (!taxInfo) {
            // Test option 2: Scrape fresh data
            console.log('No data found in database. Scraping new data...');
            taxInfo = await scrapeFederalTax();
        }
        
        // Display the results
        displayTaxInfo(taxInfo);
        
    } catch (error) {
        console.error('Error during scraping test:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

// Run the test
testScraping(); 