const fs = require('fs');
const path = require('path');

// Function to recursively search directories for .styles.ts files
function findStylesFiles(dir, stylesFiles = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively search subdirectories
            findStylesFiles(filePath, stylesFiles);
        } else if (file.endsWith('.styles.ts')) {
            stylesFiles.push(filePath);
        }
    });

    return stylesFiles;
}

// Function to extract token usages and associated properties from a file
function extractTokensFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const tokenRegex = /(\w+):\s*tokens\.(\w+)/g; // Regex to match "<property>: tokens.<tokenName>"
    const tokens = {};
    let match;

    // Find all matches for "<property>: tokens.<tokenName>"
    while ((match = tokenRegex.exec(content)) !== null) {
        tokens[match[1]] = match[2]; // Add the property name as key and token name as value
    }

    return tokens;
}

// Function to build a JSON object with parent folders as components and their tokens
function buildTokensJSON(dir) {
    const stylesFiles = findStylesFiles(dir);
    const result = {};

    stylesFiles.forEach((file) => {
        const tokens = extractTokensFromFile(file);
        if (Object.keys(tokens).length > 0) {
            const componentName = path.basename(path.dirname(file)); // Use the parent folder name as the component name
            result[componentName] = tokens;
        }
    });

    return result;
}

// Function to write the result to a JSON file
function writeJSONToFile(jsonObject, outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(jsonObject, null, 2), 'utf-8');
    console.log(`Tokens JSON file has been written to ${outputFile}`);
}

// Main script execution
const directoryToSearch = './';  // Update this with your root directory
const outputFile = './tokens.json';

const tokensJSON = buildTokensJSON(directoryToSearch);
writeJSONToFile(tokensJSON, outputFile);

// README: use `node tokensMapper.js` in terminal to run
