const fs = require('fs');
const path = require('path');

/**
 * Logs detailed simulation results to a CSV and log file
 * @param {string} name - The name of the user who ran the simulation
 * @param {Object} result - The simulation result object
 * @returns {string} - The path to the created log file
 */
exports.logSimulationResult = async (name, result) => {
    const timestamp = (new Date()).toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const csv_filename = `${name}_${timestamp}.csv`; // Create the filename with name_datetime format
    const log_filename = `${name}_${timestamp}.log`; // Create the filename with name_datetime format
    const logsDir = path.join(__dirname, '..', 'logs'); // Logs directory
    
    // Ensure the logs directory exists
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const csv_filePath = path.join(logsDir, csv_filename); // Create the full file path
    const log_filePath = path.join(logsDir, log_filename); // Create the full file path
    
    // Create a basic log file with simulation metadata
    const logContent = `Simulation run by: ${name}\nTimestamp: ${timestamp}\n`;
    fs.writeFileSync(log_filePath, logContent);
    
    // Check if we have valid simulation data
    if (!result || !result.result || !result.result.yearlyData || !Array.isArray(result.result.yearlyData) || result.result.yearlyData.length === 0) {
        console.warn('Invalid simulation result data, creating basic CSV file');
        const testMessage = `Test log entry for simulation run by: ${name}\n`;
        fs.writeFileSync(csv_filePath, testMessage);
        return csv_filePath;
    }
    
    // Extract the yearly data from the result
    const yearlyData = result.result.yearlyData;
    
    // Create CSV content
    let csvContent = '';
    
    // Get all unique investment types across all years
    const investmentTypes = new Set();
    yearlyData.forEach(yearData => {
        if (yearData.investments && Array.isArray(yearData.investments)) {
            yearData.investments.forEach(investment => {
                if (investment && investment.type && typeof investment.type === 'object') {
                    // Handle the case where type is an object with a name property
                    if (investment.type.name) {
                        investmentTypes.add(investment.type.name);
                    }
                } else if (investment && typeof investment.type === 'string') {
                    // Handle the case where type might be a string directly
                    investmentTypes.add(investment.type);
                }
            });
        }
    });
    
    // Create header row
    csvContent += 'Year';
    investmentTypes.forEach(type => {
        csvContent += `,${type}`;
    });
    csvContent += ',Total Assets\n';
    
    // Add data rows for each year
    yearlyData.forEach(yearData => {
        csvContent += yearData.year;
        
        let yearTotalAssets = 0;
        
        // Add value for each investment type
        investmentTypes.forEach(type => {
            let value = 0;
            
            if (yearData.investments && Array.isArray(yearData.investments)) {
                // Find all investments of this type and sum their values
                yearData.investments.forEach(inv => {
                    if (inv && inv.value !== undefined && !isNaN(inv.value)) {
                        const invTypeName = inv.type && inv.type.name ? inv.type.name : 
                                         (typeof inv.type === 'string' ? inv.type : null);
                        
                        if (invTypeName === type) {
                            value += Number(inv.value);
                            yearTotalAssets += Number(inv.value);
                        }
                    }
                });
            }
            
            csvContent += `,${value.toFixed(2)}`;
        });
        
        // Add total assets for the year
        csvContent += `,${yearTotalAssets.toFixed(2)}\n`;
    });
    
    // Write the CSV file
    fs.writeFileSync(csv_filePath, csvContent);
    
    // Add more detailed information to the log file
    const logDetails = `Simulation ID: ${result.simulationId}\nEnd Year: ${result.result.endYear}\nNumber of Years: ${yearlyData.length}\n`;
    fs.appendFileSync(log_filePath, logDetails);
    
    // Add detailed yearly information
    yearlyData.forEach(yearData => {
        let yearLog = `\n[${yearData.year}] `;
        
        // Log income events
        if (yearData.incomeEvents && yearData.incomeEvents.length > 0) {
            yearData.incomeEvents.forEach(event => {
                fs.appendFileSync(log_filePath, `[${yearData.year}] Income: Received ${event.name} of $${event.value.toFixed(2)}\n`);
            });
        }
        
        // Log expense events
        if (yearData.expenseEvents && yearData.expenseEvents.length > 0) {
            yearData.expenseEvents.forEach(event => {
                fs.appendFileSync(log_filePath, `[${yearData.year}] Expense: Paid ${event.name} of $${event.value.toFixed(2)}\n`);
            });
        }
        
        // Log investment changes
        if (yearData.investments && yearData.investments.length > 0) {
            yearData.investments.forEach(inv => {
                if (inv.value > 0) {
                    const typeName = inv.type && inv.type.name ? inv.type.name : 
                                   (typeof inv.type === 'string' ? inv.type : 'Unknown');
                    fs.appendFileSync(log_filePath, `[${yearData.year}] Invest: ${typeName} value: $${inv.value.toFixed(2)}\n`);
                }
            });
        }
        
        // Log taxes
        if (yearData.taxesIncurred > 0) {
            fs.appendFileSync(log_filePath, `[${yearData.year}] Tax: Paid $${yearData.taxesIncurred.toFixed(2)} in taxes\n`);
        }
        
        // Log capital gains
        if (yearData.yearGains !== 0) {
            const gainType = yearData.yearGains > 0 ? 'Gain' : 'Loss';
            fs.appendFileSync(log_filePath, `[${yearData.year}] Capital ${gainType}: $${Math.abs(yearData.yearGains).toFixed(2)}\n`);
        }
        
        // Log early withdrawals if any
        if (yearData.earlyWithdrawals > 0) {
            fs.appendFileSync(log_filePath, `[${yearData.year}] Early Withdrawal: $${yearData.earlyWithdrawals.toFixed(2)}\n`);
        }
    });
    
    return csv_filePath;
};