/**
 * Options priority order: CLI options > quantal.json > truffle-config.js
 */

const importFresh = require('import-fresh')
const _ = require('lodash')
const semver = require('semver')
const getPath = require('./utils/get-path')
const TruffleConfig = require('./truffle-config')

const CONFIG_PATH = './quantal.json'
const DEFAULT_SOLC_VERSION = '0.5.8'

/**
 * @typedef {Object} CompilerOptions
 * @property {string} name
 * @property {string} evmVersion
 * @property {Object} optimizer
 * @property {boolean} optimizer.enabled
 * @property {number} optimizer.runs
 * @property {Object} artifactContent
 */
const DEFAULT_COMPILER_OPTIONS = {
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
}

/**
 * @typedef {Object} QuantalOptions
 * @property {string} contractsDir
 * @property {string} builtContractsDir
 * @property {string} deploymentsDir
 * @property {string} cwd
 * @property {GanacheOptions} ganache
 * @property {CompilerOptions} compiler
 */
const DEFAULT_OPTIONS = {
  contractsDir: './contracts',
  builtContractsDir: './build/contracts',
  deploymentsDir: './deployments',
  compiler: DEFAULT_COMPILER_OPTIONS,
}

// Path options
const PATHS = [
  'contractsDir',
  'builtContractsDir',
  'deploymentsDir',
]

/**
 * Returns build options. Priority is as follow:
 * 1. Command line args
 * 2. quantal.json file
 * 3. truffle-conf.js file
 * @param {string} configFile Config file path
 * @returns {QuantalOptions}
 */
function getOptions(configFile = CONFIG_PATH) {
  const options = _(DEFAULT_OPTIONS)
    .merge(convertTruffleToQuantalOptions(getTruffleOptions()))
    .merge(getQuantalConfig(getPath(configFile)))
    .mapValues((value, key) => (PATHS.includes(key) ? getPath(value) : value))
    .value()

  if (!options.compiler.version)
    options.compiler.version = getSolcVersionFromPackageJson() || DEFAULT_SOLC_VERSION

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
    const packageJson = importFresh(getPath('package.json'))
    const { truffleSolcMapping } = require('./compiler-versions')
    const truffleVersionRange = _.get(packageJson, ['dependencies', 'truffle']) || _.get(packageJson, ['devDependencies', 'truffle'])
    const truffleVersion = truffleVersionRange && semver.minVersion(truffleVersionRange)
    const solcVersion = _.get(packageJson, ['dependencies', 'solc']) || _.get(packageJson, ['devDependencies', 'solc'])

    if (truffleVersion && truffleSolcMapping[truffleVersion])
      return truffleSolcMapping[truffleVersion]

    if (solcVersion)
      return solcVersion

    return undefined
  } catch (err) {
    return undefined
  }
}

function convertTruffleToQuantalOptions(truffleOptions) {
  const solcVersion = truffleOptions.compilers.solc.settings.version

  return {
    builtContractsDir: truffleOptions.contracts_build_directory,
    contractsDir: truffleOptions.contracts_directory,
    cwd: truffleOptions.working_directory,
    compiler: {
      evmVersion: truffleOptions.compilers.solc.settings.evmVersion,
      optimizer: truffleOptions.compilers.solc.settings.optimizer,
      ...(solcVersion && { version: solcVersion }),
    },
  }
}

function getTruffleOptions() {
  const truffleConfig = TruffleConfig.detect()
  const config = TruffleConfig.default().merge(truffleConfig)

  const evmVersion = _.get(config, ['compilers', 'solc', 'settings', 'evmVersion'])
        || _.get(config, ['compilers', 'solc', 'evmVersion'])
        || _.get(config, ['solc', 'evmVersion'])
        || undefined

  const optimizer = _.get(config, ['compilers', 'solc', 'settings', 'optimizer'])
        || _.get(config, ['compilers', 'solc', 'optimizer'])
        || _.get(config, ['solc', 'optimizer'])
        || {}

  const version = _.get(config, ['compilers', 'solc', 'settings', 'version'])
        || _.get(config, ['compilers', 'solc', 'version'])
        || _.get(config, ['solc', 'vesion'])
        || undefined

  config.compilersInfo = {}

  config.compilers.solc.settings.evmVersion = evmVersion
  config.compilers.solc.settings.optimizer = optimizer

  if (version)
    config.compilers.solc.settings.version = version

  return config
}

module.exports = { getOptions, getTruffleOptions }
