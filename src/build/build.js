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
  try {
    await preloadCompiler(options.compiler.version)
    const truffleOptions = getTruffleOptions()
    truffleOptions.resolver = new Resolver(truffleOptions)

    const compilation = await compileSources(options, truffleOptions)

    return {
      outputs: { [compilation.compiler]: compilation.files },
      contracts: compilation.contracts,
      warnings: compilation.warnings || [],
      errors: [],
    }
  } catch (errors) {
    if (errors.length)
      return { errors }

    throw errors
  }
}

async function compileSources(options, truffleOptions) {
  const compileFunc = truffleOptions.all === true || truffleOptions.compileAll === true
    ? solcCompile.all
    : solcCompile.necessary

  const {
    contracts, files, compilerInfo, warnings,
  } = await compileFunc(options, truffleOptions)

  if (compilerInfo) {
    truffleOptions.compilersInfo[compilerInfo.name] = {
      version: compilerInfo.version,
    }
  }

  if (contracts && Object.keys(contracts).length > 0) {
    await writeContracts(contracts, {
      builtContractsDir: options.builtContractsDir,
      networkId: truffleOptions.network_id,
    })
  }

  return { contracts, files, warnings }
}

/**
 * Write contracts to json artifacts
 * @param {Object[]} contracts
 * @param {Object} options
 * @param {string} options.builtContractsDir
 * @param {string} options.networkId
 */
async function writeContracts(contracts, options) {
  const artifactor = new Artifactor(options.builtContractsDir)
  await mkdirp(options.builtContractsDir)
  await artifactor.saveAll(contracts, { network_id: options.networkId })
}


module.exports = { build }
