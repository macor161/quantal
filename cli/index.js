const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')
const compileContracts = require('./compile-contracts')

//console.log(eblockClassTemplate({ name: 'ERC20', abi }))
async function main() {
    const options = getOptions()
    //console.log(options)
    
    try {
        //await generateJsFiles(options)
        await compileContracts()
    } catch(err) {
        console.log('Error: ', err.message)
    }
    

    await wait(15000)
    console.log('aewf')



}


function wait(ms) {
    return new Promise(res => setTimeout(res, ms))
}

process.on('uncaughtException', function (err) {
    console.log('fawefa')
    //console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
    //console.error(err.stack)
  })

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection')
})

main()