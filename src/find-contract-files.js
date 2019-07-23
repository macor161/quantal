const glob = require("glob")
const path = require("path")
const { promisify } = require('util')
const globPromise = promisify(glob)

const DEFAULT_PATTERN = "**/*.sol"

async function findContractFiles(pattern) {
    // pattern is either a directory (contracts directory), or an absolute path
    // with a glob expression
    if (!glob.hasMagic(pattern)) 
        pattern = path.join(pattern, DEFAULT_PATTERN)    

    const globOptions = {
        follow: true // follow symlinks
    }

    return globPromise(pattern, globOptions)
}

module.exports = { findContractFiles }