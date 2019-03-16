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
    const { builtContractsDir, generatedJsDir, libraryName } = opts
    const files = await readdir(builtContractsDir)

    await mkdirp(generatedJsDir)

    return files
        .filter(isJsonFile)
        .mapAsync(fileName => getContractInfo(path.join(builtContractsDir, fileName)))
        .then(filterOutInterfacesAndLibraries)
        .then(contractInfos => contractInfos.mapAsync(info => appendJsSource(info, libraryName)))        
        .then(contractInfos => contractInfos.forEachAsync(contractInfo => writeJsSource(contractInfo, generatedJsDir)))
}

function isJsonFile(fileName) {
    return path.extname(fileName).toLowerCase() === '.json'
}

function filterOutInterfacesAndLibraries(contractInfos) {
    return contractInfos.filter(info => info.abi.length > 0 && info.bytecode.length > 2)
}

async function appendJsSource(contractInfo, libraryName) {
    return {
        ...contractInfo,
        jsSource: await eblockClassTemplate(contractInfo, libraryName)
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