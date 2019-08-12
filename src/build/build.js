/**
 * @typedef {import('../options').QuantalOptions} BuildOptions
 * @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError
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
  const warningCache = new WarningCache({ builtContractsDir: options.builtContractsDir })
  await preloadCompiler(options.compiler.version)
  options.resolver = new Resolver({ cwd: options.cwd, buildDir: options.builtContractsDir })

  const compilation = await solcCompile.necessary(options)
  const allWarnings = await warningCache.updateCache({ contracts: compilation.contracts, warnings: compilation.warnings })

  if (compilation.contracts && Object.keys(compilation.contracts).length > 0)
    await writeContracts(compilation.contracts, options.builtContractsDir)

  return {
    outputs: { [compilation.compiler]: compilation.files },
    contracts: compilation.contracts,
    warnings: allWarnings,
    errors: compilation.errors,
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
