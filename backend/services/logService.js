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
                if (investment && investment.type) {
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
    csvContent += '\n';
    
    // Add data rows for each year
    yearlyData.forEach(yearData => {
        // console.log(yearlyData);
        
        csvContent += yearData.year;
        
        // Add value for each investment type
        investmentTypes.forEach(type => {
            // console.log(type);
            let value = '0.00';
            
            if (yearData.investments && Array.isArray(yearData.investments)) {
                const investment = yearData.investments.find(inv => inv && inv.type === type);
                // console.log(investment);
                
                if (investment && typeof investment.value === 'number' && !isNaN(investment.value)) {
                    value = investment.value.toFixed(2);
                }
            }
            
            csvContent += `,${value}`;
        });
        
        csvContent += '\n';
    });
    
    // Write the CSV file
    fs.writeFileSync(csv_filePath, csvContent);
    
    // Add more detailed information to the log file
    const logDetails = `Simulation ID: ${result.simulationId}\nEnd Year: ${result.result.endYear}\nNumber of Years: ${yearlyData.length}\n`;
    fs.appendFileSync(log_filePath, logDetails);
    
    return csv_filePath;
};