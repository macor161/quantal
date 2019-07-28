/**
 * @typedef {import('../options').QuantalOptions} BuildOptions
 * @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError
 */

const { mkdirp, exists } = require('fs-extra')
const path = require('path')
const Resolver = require('truffle-resolver')
const Artifactor = require('truffle-artifactor')
const _ = require('lodash')
const solcCompile = require('../compiler')
const { getTruffleOptions } = require('../options')
const { preloadCompiler } = require('../compiler/load-compiler')
const { WarningCache } = require('./warning-cache')

const CACHED_WARNING_FILENAME = '.cached-warnings.json'

/**
 * Build contracts from Solidity sources and write output
 * artifacts to json files
 * @param {BuildOptions} options Options
 */
async function build(options) {
  const warningCache = new WarningCache({ builtContractsDir: options.builtContractsDir })
  await preloadCompiler(options.compiler.version)
  const truffleOptions = getTruffleOptions()
  truffleOptions.resolver = new Resolver(truffleOptions)

  const compilation = await compileSources(options, truffleOptions)
  const allWarnings = await warningCache.updateCache({ contracts: compilation.contracts, warnings: compilation.warnings })

  return {
    outputs: { [compilation.compiler]: compilation.files },
    contracts: compilation.contracts,
    warnings: allWarnings,
    errors: compilation.errors,
  }
}

async function compileSources(options, truffleOptions) {
  const compileFunc = truffleOptions.all === true || truffleOptions.compileAll === true
    ? solcCompile.all
    : solcCompile.necessary

  const {
    contracts, files, compilerInfo, warnings, errors,
  } = await compileFunc(options, truffleOptions)

  if (compilerInfo) {
    truffleOptions.compilersInfo[compilerInfo.name] = {
      version: compilerInfo.version,
    }
  }

  if (contracts && Object.keys(contracts).length > 0)
    await writeContracts(contracts, options.builtContractsDir)

  return {
    contracts,
    files,
    warnings,
    errors,
  }
}

/**
 * Write contracts to json artifacts
 * @param {Object[]} contracts
 * @param {string} builtContractsDir
 */
async function writeContracts(contracts, builtContractsDir) {
  const artifactor = new Artifactor(builtContractsDir)
  await mkdirp(builtContractsDir)
  await artifactor.saveAll(contracts)
}

async function getCachedWarnings(builtContractsDir) {
  const cachedWarningsFile = path.join(builtContractsDir, CACHED_WARNING_FILENAME)

  return (await exists(cachedWarningsFile))
    ? (await readJson(cachedWarningsFile)).warnings
    : []
}


module.exports = { build }
