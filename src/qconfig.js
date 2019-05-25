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
function init() {
    const mainFolderPath = getFolderPath()
    const solcCachePath = getSolcCachePath()

    if (!fs.existsSync(mainFolderPath))
        fs.mkdirSync(mainFolderPath)

    if (!fs.existsSync(solcCachePath))
        fs.mkdirSync(solcCachePath)
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



module.exports = function() {
  init()
  
  return {
    getFolderPath, 
    getSolcCachePath 
  }
}