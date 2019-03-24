const importFresh = require('import-fresh')
const getPath = require('./get-path')
const _ = require('lodash')

const CONFIG_PATH = './eblocks.json'

const defaultOptions = {
    contractsDir: './contracts',
    builtContractsDir: './build/contracts',
    generatedJsDir: './src/generated-eblocks',
    deploymentsDir: './deployments',
    libraryName: 'eblocks',
    ganache: {
        seed: 'Ganache seed for development',
    },
    throttle: 50
}

// Options that represents a path
const PATHS = [
    'contractsDir',
    'builtContractsDir',
    'generatedJsDir',
    'deploymentsDir'
]

module.exports = function getOptions(configFile = CONFIG_PATH) {
    return _(defaultOptions)
        .merge(getConfigFile(getPath(configFile)))
        .mapValues((value, key) => PATHS.includes(key) ? getPath(value) : value)
        .value()
    
}


function getConfigFile(configFile) {
    try {
        return importFresh(configFile)
    } catch(err) {
        // TODO: Validate error
        return {}
    }
}