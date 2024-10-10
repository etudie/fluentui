const fs = require('fs');

// Function to replace tokens in useStyles.styles.ts
function replaceTokens(TokensFile, useStylesFile, componentName) {
    // Read TokensFile (.tokens.ts)
    const TokensContent = fs.readFileSync(TokensFile, 'utf-8');
    const TokensRegex = /tokens\.(\w+)/g;

    // Create a mapping of original token to Tokens replacement
    const tokenMap = {};
    let match;
    while ((match = TokensRegex.exec(TokensContent)) !== null) {
        const ctrlToken = `ctrl${match[1].charAt(0).toUpperCase() + match[1].slice(1)}`; // e.g., ctrlBorderRadiusCircular
        const originalToken = match[1];
        tokenMap[`tokens.${originalToken}`] = `${componentName}Tokens.${ctrlToken}`; // e.g., { "tokens.borderRadiusCircular": "Tokens.ctrlBorderRadiusCircular" }
    }

    console.log(tokenMap);

    // Read useStylesFile (useStyles.styles.ts)
    let useStylesContent = fs.readFileSync(useStylesFile, 'utf-8');

    // Replace each token in the useStylesFile
    for (const [originalToken, replacementToken] of Object.entries(tokenMap)) {
        const tokenRegex = new RegExp(originalToken, 'g'); // Create a global regex for each token
        useStylesContent = useStylesContent.replace(tokenRegex, replacementToken);
    }

    // Write the updated content back to the file
    fs.writeFileSync(useStylesFile, useStylesContent);
    console.log(`Tokens replaced successfully in ${useStylesFile}`);
}

// Example usage
const tokensFile = '../../react-components/react-avatar/library/src/components/Avatar/Avatar.tokens.ts'
const stylesFile = '../../react-components/react-avatar/library/src/components/Avatar/useAvatarStyles.styles.ts'
const componentName = 'avatar';

replaceTokens(tokensFile, stylesFile, componentName);
