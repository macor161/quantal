/**
 * Returns true if the operating system is supported by Quantal.
 * @param {string} os
 */
function isOsSupported(os) {
  return supportedSolcVersions[os] && supportedSolcVersions[os].length
}

/**
 * Supported solc versions for each operating system
 */
const supportedSolcVersions = {
  linux: ['0.5.11', '0.5.10', '0.5.9', '0.5.8', '0.5.7', '0.5.6', '0.5.5', '0.5.4', '0.5.3', '0.5.2', '0.5.1', '0.5.0', '0.4.26', '0.4.25', '0.4.24', '0.4.23', '0.4.22', '0.4.21', '0.4.20', '0.4.19', '0.4.18', '0.4.17', '0.4.16', '0.4.15', '0.4.14', '0.4.13', '0.4.12', '0.4.11'],
  mac: ['0.5.11', '0.5.10', '0.5.9', '0.5.8', '0.5.7', '0.5.6', '0.5.5', '0.5.4', '0.5.3', '0.5.2', '0.5.1', '0.5.0', '0.4.26', '0.4.25', '0.4.24', '0.4.23', '0.4.22', '0.4.21', '0.4.20', '0.4.19', '0.4.18', '0.4.17', '0.4.16', '0.4.15', '0.4.14', '0.4.13', '0.4.11', '0.4.10'],
  win: [],
}


/**
 * Mapping of solc version for each truffle version
 * truffle: solc
 */
const truffleSolcMapping = {
  '4.0.0': '0.4.18',
  '4.0.1': '0.4.18',
  '4.0.2': '0.4.18',
  '4.0.3': '0.4.18',
  '4.0.4': '0.4.18',
  '4.0.5': '0.4.18',
  '4.0.6': '0.4.19',
  '4.0.7': '0.4.19',
  '4.1.0': '0.4.19',
  '4.1.1': '0.4.19',
  '4.1.2': '0.4.19',
  '4.1.3': '0.4.19',
  '4.1.5': '0.4.21',
  '4.1.6': '0.4.21',
  '4.1.7': '0.4.23',
  '4.1.8': '0.4.23',
  '4.1.9': '0.4.24',
  '4.1.10': '0.4.24',
  '4.1.11': '0.4.24',
  '4.1.12': '0.4.24',
  '4.1.13': '0.4.24',
  '4.1.14': '0.4.24',
  '5.0.0': '0.5.0',
  '4.1.15': '0.4.25',
  '5.0.1': '0.5.0',
  '5.0.2': '0.5.0',
  '5.0.3': '0.5.0',
  '5.0.4': '0.5.0',
  '5.0.5': '0.5.0',
  '5.0.6': '0.5.0',
  '5.0.7': '0.5.0',
  '5.0.8': '0.5.0',
  '5.0.9': '0.5.0',
  '5.0.10': '0.5.0',
  '5.0.11': '0.5.0',
  '5.0.12': '0.5.0',
  '5.0.13': '0.5.0',
  '5.0.14': '0.5.0',
  '5.0.15': '0.5.0',
  '5.0.17': '0.5.0',
  '5.0.18': '0.5.0',
  '5.0.19': '0.5.0',
  '5.0.20': '^0.5.0',
  '5.0.21': '^0.5.0',
  '5.0.22': '^0.5.0',
  '5.0.24': '^0.5.0',
  '5.0.25': '^0.5.0',
  '5.0.26': '^0.5.0',
  '5.0.27': '^0.5.0',
  '5.0.28': '^0.5.0',
  '5.0.29': '^0.5.0',
  '5.0.30': '^0.5.0',
  '5.0.31': '^0.5.0',
  '5.0.32': '^0.5.0',
  '5.0.33': '^0.5.0',
  '5.0.34': '^0.5.0',
}

module.exports = { truffleSolcMapping, supportedSolcVersions, isOsSupported }
