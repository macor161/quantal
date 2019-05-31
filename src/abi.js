const importFresh = require('import-fresh')
const {readdir} = require('fs-extra')
const path = require('path')

const getCallFunctions = (abi) => abi.filter((member) => member.constant)
const getFunctions = (abi) => abi.filter((member) => member.type === 'function')

/**
 * Returns the ABIs from all truffle contract json files
 * in a folder
 * // TODO: Recursive search
 * // TODO: Validate path
 * @param {string} folderPath
 */
const getAbisInFolder = async (folderPath) => {
  const files = await readdir(folderPath)
  return files.map((file) => getAbiFromFile(path.join(folderPath, file)))
}

/**
 * Returns the ABI from a truffle contract json file
 * // TODO: Load asynchronously
 * @param {string} path
 */
const getAbiFromFile = (path) => importFresh(path).abi

module.exports = {getCallFunctions, getAbiFromFile, getAbisInFolder, getFunctions}
