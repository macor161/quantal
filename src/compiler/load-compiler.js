const { platform } = require('os')
const { createWriteStream } = require('fs')
const https = require('https')
const qconfig = require('../qconfig')

// TODO: Add checksum verification

const SUPPORTED_OS = [ 'linux', 'darwin', 'win32' ]
const DOWNLOAD_URL = 'http://solc.quantal.io'


/**
 * Download the solc compiler if not already cached
 * and returns its path
 * @param {string} version 
 * @returns {string} Compiler's path
 */
async function loadCompiler(version) {
    if (!SUPPORTED_OS.includes(platform()))
        throw `Unsupported OS: ${platform()}`

    await qconfig.init()
}


function getCompilerFilename(version) {
    const os = platform().replace('darwin', 'mac')

    return os === 'win32'
        ? `solc-${os}-${version}.exe`
        : `solc-${os}-${version}`
}


function downloadFile(from, to) {
    return new Promise((res, rej) => {
        const file = createWriteStream(to)

        https.get(from, response => {
            response.pipe(file)
        })  

        file.on('finish', () => {
            file.close(() => res())  
        }) 
    })   
}


module.exports = { loadCompiler, downloadFile, getCompilerFilename }