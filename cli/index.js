const { abi } = require('../build/contracts/ERC20.json')
const eblockClassTemplate = require('./templates/eblock-class')

console.log(eblockClassTemplate({ name: 'ERC20', abi }))
