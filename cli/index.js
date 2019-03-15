const { abi } = require('../build/contracts/ERC20.json')
const eblockClassTemplate = require('./templates/eblock-class')
const { getAbiFromFile, getAbisInFolder } = require('./abi')
const getPath = require('./get-path')
const { getContractInfo, getContractInfosFromFolder } = require('./contract-info')

//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    //console.log(await getAbisInFolder(getPath('./build/contracts')))
    console.log(await getContractInfosFromFolder(getPath('./build/contracts')))
}


//function generateEblock()

main()


