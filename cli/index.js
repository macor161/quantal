#!/usr/bin/env node
require('v8-compile-cache')
const debugMain = require('debug')('main')

debugMain('quantal start')
const package = require('../package.json')


main()

async function main() {
    try {
        const logger = console.log

        const argv = require('commander')
            .version(package.version)
            .option('-w, --watch', 'Watch for changes')
            .option('-s, --serve', 'Start a ganache server')
            .option('-v, --version', 'Show version information')
            .parse(process.argv)

        debugMain('argv loaded')

        const command = loadCommand({ argv, logger })
        debugMain('command loaded')

        await command()
        debugMain('command executed successfully')
    } catch(e) {
        console.log('Error: ', e.message)
        debugMain('Error: ', e)
    }

}



function loadCommand({ argv, logger }) {
    // TODO: commander.js doesn't support overriding the --version flag
    // We are temporarily using the commander.version() function
    // if (argv.version) {
    //     return require('./commands/version')({ argv, logger })
    // }
    // else if (argv.s) {
    if (argv.serve) {
        const getOptions = require('./get-options')
        return require('./commands/serve')({ argv, logger, getOptions })
    }
    else {
        const getOptions = require('./get-options')
        return require('./commands/build')({ argv, logger, getOptions })
    }
    
}


process.on('uncaughtException', function (e) {
    console.log('Error: ', e.message)
    debugMain('Error: ', e)
})

process.on('unhandledRejection', error => {
    // truffle-compile throws an unhandled promise rejection.   
})

