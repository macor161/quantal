const regex = /(import\s+.*(\'|\").+(\'|\");)|(pragma\s+solidity\s*(.+);)/gm

/**
 * Extract import and pragma statements from Solidity code
 * @param {string} body Solidity source code
 */
function preParse(body) {
    const regexResult = body.match(regex)        
    return (regexResult || []).join('\n')
}

module.exports = { preParse }