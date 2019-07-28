/** @typedef {import('../options').QuantalOptions} BuildOptions */

const { mkdirp } = require('fs-extra')
const Resolver = require('truffle-resolver')
const Artifactor = require('truffle-artifactor')
const solcCompile = require('../compiler')
const { getTruffleOptions } = require('../options')
const { preloadCompiler } = require('../compiler/load-compiler')

/**
 * Build contracts from Solidity sources and write output
 * artifacts to json files
 * @param {BuildOptions} options Options
 */
async function build(options) {
  await preloadCompiler(options.compiler.version)
  const truffleOptions = getTruffleOptions()
  truffleOptions.resolver = new Resolver(truffleOptions)

  const compilation = await compileSources(options, truffleOptions)

  return {
    outputs: { [compilation.compiler]: compilation.files },
    contracts: compilation.contracts,
    warnings: compilation.warnings || [],
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
    contracts, files, warnings, errors,
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
