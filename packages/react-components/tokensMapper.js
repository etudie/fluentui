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
    const result = [];

    stylesFiles.forEach((file) => {
        const tokens = extractTokensFromFile(file);
        if (Object.keys(tokens).length > 0) {
            const componentName = path.basename(path.dirname(file)); // Use the parent folder name as the component name

            // Iterate over the tokens and push formatted objects into the result array
            Object.keys(tokens).forEach((tokenName) => {
                result.push({
                    componentName: componentName,
                    tokenName: tokens[tokenName],
                    cssProperty: tokenName // Assuming the token's value is the css property
                });
            });
        }
    });

    return result;
}

// Function to write the result to a JSON file
function writeJSONToFile(jsonObject, outputFile) {
    fs.writeFileSync(outputFile, JSON.stringify(jsonObject, null, 2), 'utf-8');
    console.log(`Tokens JSON file has been written to ${outputFile}`);
}

// Function to count the occurrences of each tokenName and collect the component names
function countTokenUsage(inputFile, outputFile) {
    const tokensData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const tokenMap = {};

    tokensData.forEach(({ tokenName, componentName }) => {
        if (!tokenMap[tokenName]) {
            tokenMap[tokenName] = {
                tokenName: tokenName,
                usageCount: 0,
                componentNames: new Set() // Using Set to avoid duplicate component names
            };
        }
        tokenMap[tokenName].usageCount++;
        tokenMap[tokenName].componentNames.add(componentName);
    });

    // Convert Set to Array in the final result
    const result = Object.values(tokenMap).map(token => ({
        tokenName: token.tokenName,
        usageCount: token.usageCount,
        componentNames: Array.from(token.componentNames) // Convert Set to Array
    }));

    // Write the result to the specified output file
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
}


// Main script execution
const directoryToSearch = './';  // Update this with your root directory
const outputFile = './tokens.json';
const outputCountFile = './tokens-count.json';

const tokensJSON = buildTokensJSON(directoryToSearch);
writeJSONToFile(tokensJSON, outputFile);
countTokenUsage(outputFile, outputCountFile);


// README: use `node tokensMapper.js` in terminal to run
