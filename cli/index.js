const getOptions = require('./get-options')
const getPath = require('./get-path')
const importFresh = require('import-fresh')


//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    const options = getOptions()
    //console.log(await getAbisInFolder(getPath('./build/contracts')))
    //console.log(await getContractInfosFromFolder(getPath('./build/contracts')))
    //await generateEblockJsFile(getPath('./build/contracts/ERC20.json'), getPath('./src/generated-eblocks'))
    console.log(options)
}





//function generateEblock()

main()


