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
    const tokenRegex = /tokens\.(\w+)/g; // Regex to match "tokens.<tokenName>"
    const tokens = new Set(); // Use a Set to store unique token names
    let match;

    // Find all matches for "tokens.<tokenName>"
    while ((match = tokenRegex.exec(content)) !== null) {
        tokens.add(match[1]); // Add the token name to the Set (duplicates are ignored)
    }

    return Array.from(tokens); // Convert the Set back to an array if needed
}

// Function to generate the output
function generateFile(tokens) {
    let output = `import { tokens } from "@fluentui/tokens";\n\n`;

    tokens.forEach(token => {
        const smtcToken = `smtc${token.charAt(0).toUpperCase() + token.slice(1)}`;
        output += `export const ${smtcToken} = \`var(--${smtcToken},\${tokens.${token}}))\`;\n`;
    });

    output += `\nexport const badgeTokens = {\n`;

    tokens.forEach(token => {
        const smtcToken = `smtc${token.charAt(0).toUpperCase() + token.slice(1)}`;
        output += `    ctrl${token.charAt(0).toUpperCase() + token.slice(1)}: \`var(--ctrl${token.charAt(0).toUpperCase() + token.slice(1)},\${${smtcToken}}))\`,\n`;
    });

    output += `};\n`;

    // Write the output to a file
    fs.writeFileSync('Output.tokens.ts', output);
}


const directoryToSearch = '../../react-components/react-avatar/library/src/components/Avatar/useAvatarStyles.styles.ts';  // Update this with your file

const tokensJSON = extractTokensFromFile(directoryToSearch);
generateFile(tokensJSON);