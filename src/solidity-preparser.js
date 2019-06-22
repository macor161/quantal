module.exports = { preParse }

/**
 * Remove every line that doesn't begin with 'import' or 'pragma'
 * from a Solidity file content
 * @param {string} body 
 */
function preParse(body) {
    return body.replace(/(^(?!(\s*)import)(?!(\s*)pragma)[^\n]*)/gm, '')
}