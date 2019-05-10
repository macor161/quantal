const { platform } = require('os')
const { createWriteStream, exists } = require('fs')
const qconfig = require('../qconfig')
const path = require('path')
const request = require('request')
const progress = require('request-progress')

// TODO: Add checksum verification

const SUPPORTED_OS = [ 'linux', 'darwin', 'win32' ]
const DOWNLOAD_URL = 'http://solc.quantal.io'
const LATEST_VERSION = '0.5.8'


/**
 * Download the solc compiler if not already cached
 * and return its path
 * @param {string} version 
 * @returns {string} Compiler's path
 */
async function loadCompiler(version = LATEST_VERSION) {
    if (!SUPPORTED_OS.includes(platform()))
        throw `Unsupported OS: ${platform()}`

    await qconfig.init()

    const solcFilename = getCompilerFilename(version)
    const compilerPath = await getCachedCompiler(filename)

    return compilerPath
        || downloadFile(`${DOWNLOAD_URL}/${solcFilename}`, qconfig.getSolcCachePath())
         
}

/**
 * Returns the compiler's path if it exists,
 * returns null otherwise
 * 
 * @param {string} filename 
 * @returns {string}
 */
async function getCachedCompiler(filename) {
    const filePath = path.resolve(qconfig.getSolcCachePath(), filename)
    return exists(filePath)
        ? filePath
        : null
}


function getCompilerFilename(version) {
    const os = platform().replace('darwin', 'mac')

    return os === 'win32'
        ? `solc-${os}-${version}.exe`
        : `solc-${os}-${version}`
}


function downloadFile(from, to) {
    return new Promise((res, rej) => {
        const fileName = path.basename(from)
        const filePath = path.resolve(to, fileName)
        const file = createWriteStream(filePath)

        console.log(`Downloading ${fileName}...`)

        progress(request(from))
        .pipe(file)
        .on('progress', state => {
            // The state is an object that looks like this:
            // {
            //     percent: 0.5,               // Overall percent (between 0 to 1)
            //     speed: 554732,              // The download speed in bytes/sec
            //     size: {
            //         total: 90044871,        // The total payload size in bytes
            //         transferred: 27610959   // The transferred payload size in bytes
            //     },
            //     time: {
            //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
            //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
            //     }
            // }
        })
        .on('error', err => {
            
        })
        .on('end', () => {
            
        })
         

        file.on('finish', () => {
            file.close(() => res(filePath))  
        }) 
    })   
}


module.exports = { loadCompiler, downloadFile, getCompilerFilename }