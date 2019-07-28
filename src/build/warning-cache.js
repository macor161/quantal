/** @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError */

const {
  mkdirp, readJson, writeJson, exists, remove,
} = require('fs-extra')
const _ = require('lodash')
const path = require('path')

const CACHED_WARNING_FILENAME = '.cached-warnings.json'

class WarningCache {
  /**
   *
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
   *
   * @param {Object} compileResults
   * @param {Object} compileResults.contracts
   * @param {DetailedCompilerError[]} compileResults.warnings
   * @returns {DetailedCompilerError[]} All warnings from cache and compilation results
   */
  async updateCache(compileResults) {
    await this._fetchCache()
    const { contracts, warnings } = compileResults

    const compiledFiles = Object.values(contracts)
      .map(contract => contract.sourcePath)
      .filter(file => file !== undefined)

    const compiledWarningFiles = warnings
      .map(warning => _.get(warning, ['sourceLocation', 'file']))

    const allCompiledFiles = compiledFiles
      .concat(compiledWarningFiles)
      .filter(file => file !== undefined)

    const cachedWarnings = this._cachedWarnings
      .filter(warning => {
        const warningFilePath = _.get(warning, ['sourceLocation', 'file'])

        return warningFilePath
          && this._contractFileExists(warningFilePath)
          && !allCompiledFiles.includes(warningFilePath)
      })

    const allWarnings = warnings.concat(cachedWarnings)

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

  _contractFileExists(contractPath) {
    return contractPath && true
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

module.exports = { WarningCache }
