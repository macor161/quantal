const importFresh = require('import-fresh')
 
const getCallFunctions = abi => abi.filter(member => member.constant)


const getAbiFromFile = path => importFresh(path).abi



module.exports = { getCallFunctions, getAbiFromFile }