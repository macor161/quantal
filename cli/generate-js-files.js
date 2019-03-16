const { getContractInfo, getContractInfosFromFolder } = require('./contract-info')
const eblockClassTemplate = require('./templates/eblock-class')
const { readdir } = require('fs-extra')
const mkdirp = require('mkdirp')
const { writeFile } = require('fs-extra')
const path = require('path')
require('./utils/array-async')

/**
 * 
 * @param {Object} opts 
 * @param {string} opts.builtContractsDir
 * @param {string} opts.generatedJsDir
 */
async function generateJsFiles(opts) {
    const { builtContractsDir, generatedJsDir } = opts
    const files = await readdir(builtContractsDir)

    await mkdirp(generatedJsDir)

    return files
        .filter(isJsonFile)
        .mapAsync(fileName => getContractInfo(path.join(builtContractsDir, fileName)))
        .then(contractInfos => contractInfos.filter(info => info))
        .then(contractInfos => contractInfos.mapAsync(appendJsSource))        
        .then(contractInfos => contractInfos.forEachAsync(contractInfo => writeJsSource(contractInfo, generatedJsDir)))
}

function isJsonFile(fileName) {
    return path.extname(fileName).toLowerCase() === '.json'
}

async function appendJsSource(contractInfo) {
    return {
        ...contractInfo,
        jsSource: await eblockClassTemplate(contractInfo)
    }
}

async function writeJsSource(contractInfo, outputPath) {
    return writeFile(path.join(outputPath, `${contractInfo.name}.js`), contractInfo.jsSource)
}

/**
 * Returns null for interfaces and libraries
 * 
 * @param {string} inputPath 
 * @param {string} outputPath 
 */
async function generateEblockJsFile(inputPath, outputPath) {
    await mkdirp(outputPath)
    const info = await getContractInfo(inputPath)
    const templ = await eblockClassTemplate(info)
    await writeFile(path.join(outputPath, `${info.name}.js`), templ)
    //console.log(templ)
}

module.exports = { generateJsFiles }