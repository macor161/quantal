const regex = /(^import\s+.*(\'|\").+(\'|\");$)|(^pragma\s+solidity\s*(.+);$)/gm

/**
 * Extract import and pragma statements from Solidity code
 * @param {string} body Solidity source code
 */
function preParse(body) {
    return body
        .match(regex)
        .join('\n')
}

module.exports = { preParse }