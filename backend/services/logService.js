const fs = require('fs');
const path = require('path');

// TODO This function is just a basic placeholder for testing as we still don't have simulation results implemented.
// Still need to implement creating .csv files.
exports.logSimulationResult = async (name, result) => {
    const timestamp = (new Date()).toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const filename = `${name}_${timestamp}.log`; // Create the filename with name_datetime format
    const logsDir = path.join(__dirname, '..', 'logs'); // Logs directory
    
    // Ensure the logs directory exists
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const filePath = path.join(logsDir, filename); // Create the full file path
    
    // For now, just write a basic test message
    const testMessage = `Test log entry for simulation run by: ${name}\n`;
    
    // Write the file
    fs.writeFileSync(filePath, testMessage);
    
    return filePath;
};