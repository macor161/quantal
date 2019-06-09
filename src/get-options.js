/**
 * Options priority order: CLI options > quantal.json > truffle-config.js
 */

const importFresh = require('import-fresh')
const getPath = require('./get-path')
const TruffleConfig = require('truffle-config')
const _ = require('lodash')

const CONFIG_PATH = './quantal.json'

const DEFAULT_OPTIONS = {
  contractsDir: './contracts',
  builtContractsDir: './build/contracts',
  deploymentsDir: './deployments',
  ganache: {
    seed: 'Ganache seed for development',
  },
  compiler: {
    name: 'solc',
    version: '0.5.8',
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
  return _(DEFAULT_OPTIONS)
      .merge(getTruffleConfig())
      .merge(getQuantalConfig(getPath(configFile)))
      .mapValues((value, key) => PATHS.includes(key) ? getPath(value) : value)
      .value()
}

function getQuantalConfig(configFile) {
  try {
    return importFresh(configFile)
  } catch (err) {
    // TODO: Validate error
    return {}
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
      version,
      evmVersion,
      optimizer,
    },
  }
}
