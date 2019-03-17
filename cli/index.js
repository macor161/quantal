const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')
const compileContracts = require('./compile-contracts')
const fs = require('fs')
const path = require('path')
const { throttle } = require('lodash')
const options = getOptions()


let isBuildRunning = false

const build = throttle(async (options) => {    
    try {
        if (isBuildRunning) 
            return

        isBuildRunning = true
        console.log('Building')
        await compileContracts(options)
        await generateJsFiles(options)
        console.log('done')

        isBuildRunning = false

    } catch(err) {
        console.log('Error: ', err.message)
    }
}, options.throttle, { trailing: false })

//async function build(options) { return buildThrottled(options) }

async function ganacheServer(options) {
    var ganache = require("ganache-cli")
    var server = ganache.server()
    server.listen(8545, (err, blockchain) => {
        if (err) {
            console.log('Ganache error: ', err)
        }

        console.log(blockchain)
    })    
}


async function watch() {
    
    fs.watch(getPath('contracts'), async (eventType, fileName) => {
        if (path.extname(fileName).toLowerCase() !== '.sol')
            return

        console.log(`${eventType} file change: ${fileName}`)
        await build(options)
    })
}



function isDuplicatedEvent(event, fileName) {

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
//ganacheServer()