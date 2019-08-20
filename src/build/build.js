/**
 * @typedef {import('../options').QuantalOptions} QuantalOptions
 * @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError
 *
 * @typedef {Object} BuildOptions
 * @augments QuantalOptions
 * @property {function} onUpdate
 */

const { mkdirp } = require('fs-extra')
const Artifactor = require('truffle-artifactor')
const Resolver = require('../resolver')
const solcCompile = require('../compiler')
const { preloadCompiler } = require('../compiler/load-compiler')
const { WarningCache } = require('./warning-cache')

/**
 * Build contracts from Solidity sources and write output
 * artifacts to json files
 * @param {BuildOptions} options Options
 */
async function build(options) {
  await preloadCompiler(options.compiler.version)
  const warningCache = new WarningCache({ builtContractsDir: options.builtContractsDir })
  options.resolver = new Resolver({ cwd: options.cwd, buildDir: options.builtContractsDir })
  const compileFunc = options.noCache
    ? solcCompile.all
    : solcCompile.necessary

  const {
    contracts, files, warnings, errors,
  } = await compileFunc(options)
  let allWarnings = warnings

  if (options.builtContractsDir) {
    allWarnings = await warningCache.updateCache({ contracts, warnings })

    if (contracts && Object.keys(contracts).length > 0)
      await writeContracts(contracts, options.builtContractsDir)
  }

  return {
    files,
    contracts,
    warnings: allWarnings,
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


module.exports = { build }
