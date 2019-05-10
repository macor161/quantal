const { platform } = require('os')
const { createWriteStream, exists, chmodSync } = require('fs-extra')
const qconfig = require('../qconfig')
const path = require('path')
const request = require('request')
const progress = require('request-progress')

// TODO: Add checksum verification

const SUPPORTED_OS = [ 'linux', /*'darwin', 'win32'*/ ]
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

    return (await isCompilerInCache(version))
        ? await getCachedCompiler(version)
        : downloadCompiler(version)
         
}

/**
 * Returns the compiler's path if it exists,
 * returns null otherwise
 * 
 * @param {string} version 
 * @returns {string}
 */
async function getCachedCompiler(version = LATEST_VERSION) {
    const filename = getCompilerFilename(version)
    const filePath = path.resolve(qconfig.getSolcCachePath(), filename)

    return (await exists(filePath))
        ? filePath
        : null
}

async function isCompilerInCache(version = LATEST_VERSION) {
    return (await getCachedCompiler(version)) !== null
}


function getCompilerFilename(version = LATEST_VERSION) {
    const os = platform().replace('darwin', 'mac')

    return os === 'win32'
        ? `solc-${os}-${version}.exe`
        : `solc-${os}-${version}`
}


function downloadCompiler(version = LATEST_VERSION) {
    const filename = getCompilerFilename(version)
    
    return downloadFile(`${DOWNLOAD_URL}/${version}/${filename}`, qconfig.getSolcCachePath())
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
            file.close(() => {
                chmodSync(filePath, "755")
                res(filePath)
            })  
        }) 
    })   
}


module.exports = { loadCompiler, downloadCompiler, getCompilerFilename, isCompilerInCache }