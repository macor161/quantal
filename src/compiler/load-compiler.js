const getOs = require('../utils/get-os')
const { createWriteStream, exists, chmodSync } = require('fs-extra')
const qconfig = require('../qconfig')()
const path = require('path')
const { maxSatisfying } = require('semver')
const { supportedSolcVersions, isOsSupported } = require('../compiler-versions')

const DOWNLOAD_URL = 'http://solc.quantal.io'
const LATEST_VERSION = '0.5.9'

/**
 * Download compiler if not already in cache.
 * Set its permission as executable
 *
 * @param {string} version
 */
async function preloadCompiler(version = LATEST_VERSION) {
  version = getFormattedVersion(version)
  if (!isOsSupported(getOs())) {
    throw new Error(`Unsupported OS: ${getOs()}`)
  }

  const cachedCompilerPath = await getCachedCompilerPath(version)

  if (!(await exists(cachedCompilerPath))) {
    await downloadCompiler(version)
  }

  chmodSync(cachedCompilerPath, '755')
}

/**
 * Download the solc compiler if not already cached
 * and return its path
 * @param {string} version
 * @return {string} Compiler's path
 */
async function loadCompiler(version = LATEST_VERSION) {
  version = getFormattedVersion(version)
  if (!isOsSupported(getOs())) {
    throw new Error(`Unsupported OS: ${getOs()}`)
  }

  return (await isCompilerInCache(version))
    ? await getCachedCompiler(version)
    : downloadCompiler(version)
}

async function getCachedCompilerPath(version) {
  const filename = getCompilerFilename(version)
  return path.resolve(qconfig.getSolcCachePath(), filename)
}

/**
 * Returns the compiler's path if it exists,
 * returns null otherwise
 *
 * @param {string} version
 * @return {string}
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
  const os = getOs()

  return os === 'win32'
    ? `solc-${os}-${version}.exe`
    : `solc-${os}-${version}`
}

function downloadCompiler(version) {
  return new Promise((res, rej) => {
    const fileName = getCompilerFilename(version)

    console.log(`Downloading ${fileName}...`)

    const request = require('request')
    const progress = require('request-progress')
    const { Bar, Presets } = require('cli-progress')

    const url = `${DOWNLOAD_URL}/${version}/${fileName}`
    const filePath = path.resolve(qconfig.getSolcCachePath(), fileName)
    const progressBar = new Bar({}, Presets.shades_classic)

    progressBar.start(100, 0)

    const fileRequest = progress(request(url), {
      throttle: 500,
    })
      .on('progress', (state) => {
        progressBar.update(parseInt(state.percent * 100))
      })
      .on('response', (response) => {
        if (response.statusCode === 200) {
          const fileStream = createWriteStream(filePath)
            .on('finish', () => {
              fileStream.close(() => {
                res(filePath)
              })
            })
          fileRequest.pipe(fileStream)
        } else {
          rej(new Error(`Unable to find solc ${version}`))
        }
      })
      .on('error', (err) => {

      })
      .on('end', () => {
        progressBar.update(100)
        progressBar.stop()
      })
  })
}

function getFormattedVersion(version = LATEST_VERSION) {
  return maxSatisfying(supportedSolcVersions[getOs()], version)
}

module.exports = { preloadCompiler, getFormattedVersion, loadCompiler }
