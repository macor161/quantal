const importFresh = require('import-fresh')
const { readdir } = require('fs-extra')
const path = require('path')

const FUNCTION_TYPE = 'function'


/**
 * Returns the contract information from all truffle json files
 * in a folder 
 * // TODO: Validate path
 * @param {string} folderPath 
 */
const getContractInfosFromFolder = async folderPath => {
    const files = await readdir(folderPath)
    return files.map(file => getContractInfo(path.join(folderPath, file)))
}


async function getContractInfo(path) {
    const { contractName, abi, ast, bytecode, devdoc } = getContractFile(path)

    if (abi.length === 0 || bytecode.length < 3)
        return null
        
    return {
        name: contractName,
        abi,
        ast,
        bytecode,
        devdoc,
        viewFunctions: getViewFunctions(abi, devdoc),
        stateModifierFunctions: getStateModifierFunctions(abi, devdoc)
    }
}

function getViewFunctions(abi, devdoc) {
    return abi
        .filter(member => member.constant && member.type === FUNCTION_TYPE)
        .map(viewFunction => ({
            ...viewFunction,
            doc: getDocForAbiFunction(viewFunction, devdoc)
        }))
}

function getStateModifierFunctions(abi, devdoc) { 
    return abi
        .filter(member => !member.constant && member.type === FUNCTION_TYPE)
        .map(abiFunction => ({
            ...abiFunction,
            doc: getDocForAbiFunction(abiFunction, devdoc)
        }))
}

/**
 * // TODO: Get doc
 * @param {Object} abiFunction 
 * @param {Object} devdoc 
 */
function getDocForAbiFunction(abiFunction, devdoc) {
    return {}
}




/**
 * Returns the smart contract json file content
 * // TODO: Load asynchronously
 * @param {string} path 
 */
const getContractFile = path => importFresh(path)


module.exports = { getContractInfo, getContractInfosFromFolder }