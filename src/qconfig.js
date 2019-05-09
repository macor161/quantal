/**
 * Manages global config information
 */

const { homedir } = require('os')
const path = require('path')
const fs = require('fs-extra')

const FOLDER_NAME = '.quantal'


/**
 * Creates config folders if they don't exist
 */
async function init() {
    const mainFolderPath = getFolderPath()
    const solcCachePath = getSolcCachePath()

    if (!(await fs.exists(mainFolderPath)))
        await fs.mkdir(mainFolderPath)

    if (!(await fs.exists(solcCachePath)))
        await fs.mkdir(solcCachePath)
}

 /**
  * Return the config folder path
  */
function getFolderPath() {
   return path.resolve(homedir(), FOLDER_NAME)
}

/**
 * Return the solc cache path
 */
function getSolcCachePath() {
  return path.resolve(getFolderPath(), 'solc')
}



module.exports = { init, getFolderPath, getSolcCachePath }