/**
 * Options priority order: CLI options > quantal.json > truffle-config.js
 */

const importFresh = require('import-fresh')
const getPath = require('./get-path')
const TruffleConfig = require('./truffle-config')
const _ = require('lodash')
const semver = require('semver')

const CONFIG_PATH = './quantal.json'
const DEFAULT_SOLC_VERSION = '0.5.8'

const DEFAULT_OPTIONS = {
  contractsDir: './contracts',
  builtContractsDir: './build/contracts',
  deploymentsDir: './deployments',
  ganache: {
    seed: 'Ganache seed for development',
  },
  compiler: {
    name: 'solc',
    evmVersion: undefined,
    optimizer: {
      enabled: false,
      runs: 0,
    },
    artifactContent: {
      '*': {
        '': [
          'legacyAST',
          'ast',
        ],
        '*': [
          'abi',
          'metadata',
          'evm.bytecode.object',
          'evm.bytecode.sourceMap',
          'evm.deployedBytecode.object',
          'evm.deployedBytecode.sourceMap',
          'userdoc',
          'devdoc',
        ],
      },
    },
  },
}

// Options that represents a path
const PATHS = [
  'contractsDir',
  'builtContractsDir',
  'generatedJsDir',
  'deploymentsDir',
]

module.exports = function getOptions(configFile = CONFIG_PATH) {
  const options = _(DEFAULT_OPTIONS)
      .merge(getTruffleConfig())
      .merge(getQuantalConfig(getPath(configFile)))
      .mapValues((value, key) => PATHS.includes(key) ? getPath(value) : value)
      .value()

  if (!options.compiler.version) {
    options.compiler.version = getSolcVersionFromPackageJson() || DEFAULT_SOLC_VERSION
  }

  return options
}

function getQuantalConfig(configFile) {
  try {
    return importFresh(configFile)
  } catch (err) {
    // TODO: Validate error
    return {}
  }
}

/**
 * Tries to get the solc version from the project's 
 * package.json file. Looking for the "solc" or "truffle"
 * dependencies.
 * 
 * @return {string | undefined} solc version or `undefined`
 */
function getSolcVersionFromPackageJson() {
  try {
    const package = importFresh(getPath('package.json'))
    const truffleVersionMapping = require('./truffle-solc-versions')
    const truffleVersionRange = _.get(package, ['dependencies', 'truffle']) || _.get(package, ['devDependencies', 'truffle'])
    const truffleVersion = truffleVersionRange && semver.minVersion(truffleVersionRange)
    const solcVersion = _.get(package, ['dependencies', 'solc']) || _.get(package, ['devDependencies', 'solc'])

    if (truffleVersion && truffleVersionMapping[truffleVersion])
      return truffleVersionMapping[truffleVersion]
    
    if (solcVersion)
      return solcVersion

    return undefined
      
  } catch(err) {
    return undefined
  }
}



function getTruffleConfig() {
  const truffleConfig = TruffleConfig.detect({all: true})
  const config = TruffleConfig.default().merge(truffleConfig)

  const evmVersion =
        _.get(config, [ 'solc', 'evmVersion' ]) ||
        _.get(config, [ 'compilers', 'solc', 'evmVersion']) ||
        _.get(config, ['compilers', 'solc', 'settings', 'evmVersion']) ||
        undefined

  const optimizer =
        _.get(config, ['solc', 'optimizer']) ||
        _.get(config, ['compilers', 'solc', 'settings', 'optimizer']) ||
        _.get(config, ['compilers', 'solc', 'optimizer']) ||
        undefined

  const version =
        _.get(config, ['solc', 'vesion']) ||
        _.get(config, ['compilers', 'solc', 'settings', 'version']) ||
        _.get(config, ['compilers', 'solc', 'version']) ||
        undefined

  // TODO: artifactContent

  return {
    contractsDir: config.contracts_directory,
    builtContractsDir: config.contracts_build_directory,
    compiler: {
      //version: semver.valid(version) && semver.minVersion(version).version ,
      ...(semver.valid(version) && { version: semver.minVersion(version).version }),
      evmVersion,
      optimizer,
    },
  }
}
