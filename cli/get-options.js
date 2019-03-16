const importFresh = require('import-fresh')
const getPath = require('./get-path')

const CONFIG_PATH = './eblocks.json'

const defaultOptions = {
    contractsDir: './contracts',
    generatedJsDir: './src/eblocks',
    deploymentsDir: './deployments'
}


module.exports = function getOptions(configFile = CONFIG_PATH) {
    return {
        ...defaultOptions,
        ...getConfigFile(getPath(configFile))
    }
}


function getConfigFile(configFile) {
    try {
        return importFresh(configFile)
    } catch(err) {
        // TODO: Validate error
        return {}
    }
}