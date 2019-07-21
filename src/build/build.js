const { mkdirp } = require('fs-extra')
const expect = require('truffle-expect')
const Resolver = require('truffle-resolver')
const Artifactor = require('truffle-artifactor')
const Config = require('../truffle-config')
const solcCompile = require('../compiler')
const { preloadCompiler} = require('../compiler/load-compiler')
const multiPromisify = require('../utils/multi-promisify')

/**
 * Build contracts from Solidity sources and write output
 * artifacts to json files
 * @param {Object} options Options
 */
async function build(options) {
  try {
    await preloadCompiler(options.compiler.version)
    const config = prepareConfig()
    const compilation = await compileSources(config)

    return {
      outputs: { [compilation.compiler]: compilation.files },
      contracts: compilation.contracts,
      warnings: compilation.warnings || [],
      errors: []
    }
  } catch (errors) {
    if (errors.length) {
      return { errors }
    } else {
      throw errors
    }
  }
}


function prepareConfig() {
  // Currently recompiles all contracts everytime to make sure
  // we receive all warning messages
  const options = Config.detect({all: true})  
  expect.options(options, ['contracts_build_directory'])
  expect.one(options, ['contracts_directory', 'files'])

  // Use a config object to ensure we get the default sources.
  const config = Config.default().merge(options)

  config.compilersInfo = {}

  if (!config.resolver) config.resolver = new Resolver(config)

  if (!config.artifactor) 
    config.artifactor = new Artifactor(config.contracts_build_directory)
  
  return config
}


async function compileSources(config) {
  const compileFunc = config.all === true || config.compileAll === true
      ? solcCompile.all
      : solcCompile.necessary

  const {contracts, files, compilerInfo, warnings} = await compileFunc(config)

  if (compilerInfo) {
    config.compilersInfo[compilerInfo.name] = {
      version: compilerInfo.version,
    }
  }

  if (contracts && Object.keys(contracts).length > 0) 
    await writeContracts(contracts, config)    

  return {contracts, files, warnings}  
}


async function writeContracts(contracts, options) {
  await mkdirp(options.contracts_build_directory)
  await options.artifactor.saveAll(contracts, {network_id: options.network_id})
}


module.exports = { build }
