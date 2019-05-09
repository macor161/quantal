/**
 * Manages global config information
 */

const { homedir } = require('os')
const path = require('path')

const FOLDER_NAME = '.quantal'

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



module.exports = { getFolderPath, getSolcCachePath }