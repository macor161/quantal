const { abi } = require('../build/contracts/ERC20.json')
const eblockClassTemplate = require('./templates/eblock-class')
const { getAbiFromFile, getAbisInFolder } = require('./abi')
const getPath = require('./get-path')

//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    console.log(await getAbisInFolder(getPath('./build/contracts')))
}

main()


