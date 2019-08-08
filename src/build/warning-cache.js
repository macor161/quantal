/** @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError */

const {
  mkdirp, readJson, writeJson, exists, remove, existsSync,
} = require('fs-extra')
const _ = require('lodash')
const path = require('path')

const CACHED_WARNING_FILENAME = '.cached-warnings.json'

class WarningCache {
  /**
   * @param {Object} options Options
   * @param {string} options.builtContractsDir
   */
  constructor(options) {
    this._builtContractsDir = options.builtContractsDir
    this._cachedWarnings = []
    this._cacheFileName = options.cacheFileName || CACHED_WARNING_FILENAME
    this._cachePath = path.join(this._builtContractsDir, this._cacheFileName)
  }

  /**
   * @param {Object} compileResults Compile results
   * @param {Object} compileResults.contracts
   * @param {DetailedCompilerError[]} compileResults.warnings
   * @returns {DetailedCompilerError[]} All warnings from cache and compilation results
   */
  async updateCache(compileResults) {
    await this._fetchCache()
    const { warnings } = compileResults

    const allWarnings = _(this._cachedWarnings)
      .filter(warn => this._contractFileExistsForWarning(warn))
      .concat(warnings)
      .uniqBy(getWarningHash)
      .value()

    await this._saveWarnings(allWarnings)

    return allWarnings
  }

  async _fetchCache() {
    try {
      await mkdirp(this._builtContractsDir)

      if (await exists(this._cachePath)) {
        const cachedWarnings = (await readJson(this._cachePath)).warnings

        if (Array.isArray(cachedWarnings))
          this._cachedWarnings = cachedWarnings
      }
    } catch (error) {
      // The file is probably corrupted, delete it
      await this._deleteCacheFile()
    }
  }

  _contractFileExistsForWarning(warning) {
    const contractPath = getWarningFilePath(warning)
    return contractPath
      ? existsSync(contractPath)
      : false
  }

  async _deleteCacheFile() {
    if (await exists(this._cachePath))
      await remove(this._cachePath)
  }

  /**
   * Save warnings to cache file
   * @param {DetailedCompilerError[]} warnings
   */
  async _saveWarnings(warnings) {
    await writeJson(this._cachePath, { warnings })
  }
}

/**
 * @param {DetailedCompilerError} warn
 */
function getWarningHash(warn) {
  return warn.sourceLocation
    ? `${warn.sourceLocation}:${warn.sourceLocation.start}:${warn.sourceLocation.end}`
    : warn.formattedMessage
}

/**
 * @param {DetailedCompilerError} warn
 */
function getWarningFilePath(warning) {
  return _.get(warning, ['sourceLocation', 'absolutePath'])
    || _.get(warning, ['sourceLocation', 'file'])
}

module.exports = { WarningCache }
