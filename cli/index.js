const { abi } = require('../build/contracts/ERC20.json')
const eblockClassTemplate = require('./templates/eblock-class')
const { getAbiFromFile } = require('./abi')
const getPath = require('./get-path')

//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
console.log(getAbiFromFile(getPath('./build/contracts/ERC20.json')))


