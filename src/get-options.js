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
 * @typedef {Object} QuantalOptions
 * @property {string} contractsDir
 * @property {string} builtContractsDir
 * @property {string} deploymentsDir
 * @property {GanacheOptions} ganache
 */
const DEFAULT_OPTIONS = {
  contractsDir: './contracts',
  builtContractsDir: './build/contracts',
  deploymentsDir: './deployments',
  ganache: DEFAULT_GANACHE_OPTIONS,
  compiler: DEFAULT_COMPILER_OPTIONS,
}

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
 * @typedef {Object} GanacheOptions
 * @property {string} seed
 */
const DEFAULT_GANACHE_OPTIONS = {
  seed: 'Ganache seed for development',
}

// Options that represents a path
const PATHS = [
  'contractsDir',
  'builtContractsDir',
  'generatedJsDir',
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
    .merge(getTruffleConfig())
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


function getTruffleConfig() {
  const truffleConfig = TruffleConfig.detect({ all: true })
  const config = TruffleConfig.default().merge(truffleConfig)

  const evmVersion = _.get(config, ['solc', 'evmVersion'])
        || _.get(config, ['compilers', 'solc', 'evmVersion'])
        || _.get(config, ['compilers', 'solc', 'settings', 'evmVersion'])
        || undefined

  const optimizer = _.get(config, ['solc', 'optimizer'])
        || _.get(config, ['compilers', 'solc', 'settings', 'optimizer'])
        || _.get(config, ['compilers', 'solc', 'optimizer'])
        || undefined

  const version = _.get(config, ['solc', 'vesion'])
        || _.get(config, ['compilers', 'solc', 'settings', 'version'])
        || _.get(config, ['compilers', 'solc', 'version'])
        || undefined


  // TODO: artifactContent

  return {
    contractsDir: config.contracts_directory,
    builtContractsDir: config.contracts_build_directory,
    compiler: {
      ...(version && { version }),
      evmVersion,
      optimizer,
    },
  }
}

module.exports = getOptions
