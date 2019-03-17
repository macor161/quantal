const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')
const compileContracts = require('./compile-contracts')
const fs = require('fs')

//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    const options = getOptions()
    
    try {
        console.log('Updating files')
        await compileContracts(options)
        await generateJsFiles(options)
        console.log('done')
    } catch(err) {
        console.log('Error: ', err.message)
    }

}


async function watch() {
    fs.watch(getPath('contracts'), async (eventType, fileName) => {
        console.log(`${eventType} file change: ${fileName}`)
        await main()
    })
}


function wait(ms) {
    return new Promise(res => setTimeout(res, ms))
}

process.on('uncaughtException', function (err) {
    console.log('Error: ', err.message)
})

process.on('unhandledRejection', error => {
    // truffle-compile throws an unhandled promise rejection.   
})

watch()