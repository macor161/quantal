const importFresh = require('import-fresh')
const getPath = require('./get-path')
const _ = require('lodash')

const CONFIG_PATH = './eblocks.json'

const defaultOptions = {
    contractsDir: './contracts',
    builtContractsDir: './build/contracts',
    generatedJsDir: './src/generated-eblocks',
    deploymentsDir: './deployments'
}

// Options that represents a path
const PATHS = [
    'contractsDir',
    'builtContractsDir',
    'generatedJsDir',
    'deploymentsDir'
]

module.exports = function getOptions(configFile = CONFIG_PATH) {
    return _.mapValues({
        ...defaultOptions,
        ...getConfigFile(getPath(configFile))
    }, 
        (value, key) => PATHS.includes(key) ? getPath(value) : value
    )
}


function getConfigFile(configFile) {
    try {
        return importFresh(configFile)
    } catch(err) {
        // TODO: Validate error
        return {}
    }
}