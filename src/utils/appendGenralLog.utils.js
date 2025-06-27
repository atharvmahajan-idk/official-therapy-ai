import path from "path";
import fs from "fs/promises";

async function appendGeneralLog(message) {
    const logFilePath = path.resolve('src/logs', 'genral.log.txt');
    console.log("Appending to log file:", logFilePath);
    const logMessage = `${message}\n`;

    try {
        // Append the log message to the file
        await fs.appendFile(logFilePath, logMessage);
        console.log("message appended in the log file");
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
}

export { appendGeneralLog };