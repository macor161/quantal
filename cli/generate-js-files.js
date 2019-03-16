const { getContractInfo, getContractInfosFromFolder } = require('./contract-info')
const mkdirp = require('mkdirp')
const { writeFile } = require('fs-extra')
const path = require('path')

/**
 * 
 * @param {Object} opts 
 * @param {string} opts.contractsDir
 * @param {string} opts.generatedJsDir
 */
async function generateJsFiles(opts) {
    const { contractsDir, generatedJsDir } = opts
    const files = await readdir(contractsDir)
    return files.map(file => 
        generateEblockJsFile(path.join(folderPath, file), generatedJsDir)
    )    
}

async function generateEblockJsFile(inputPath, outputPath) {
    await mkdirp(outputPath)
    const info = await getContractInfo(inputPath)
    const templ = await eblockClassTemplate(info)
    await writeFile(path.join(outputPath, `${info.name}.js`), templ)
    //console.log(templ)
}

module.exports = { generateJsFiles }