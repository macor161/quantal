const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')


//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    const options = getOptions()
    //console.log(options)
    await generateJsFiles(options)
    //console.log(await getAbisInFolder(getPath('./build/contracts')))
    //console.log(await getContractInfosFromFolder(getPath('./build/contracts')))
    //await generateEblockJsFile(getPath('./build/contracts/ERC20.json'), getPath('./src/generated-eblocks'))
    //console.log(options)
}





//function generateEblock()

main()


