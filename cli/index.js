#!/usr/bin/env node
const debugMain = require('debug')('main')

debugMain('quantal start')
const getOptions = require('./get-options')
const build = require('./build')
const { ganacheServer } = require('./ganache-server')
const requireDir = require('require-dir')
const { join, resolve } = require('path')
const package = require('../package.json')



main()


async function main() {
    try {
        const argv = require('commander')
            .option('-w, --watch', 'Watch for changes')
            .option('-s', 'Start a ganache server')
            .option('-v, --version', 'Show version information')
            .parse(process.argv)

        debugMain('argv loaded')

        const command = loadCommand(argv)
        debugMain('command loaded')

        await command()
        debugMain('command executed successfully')
    } catch(e) {
        console.log('Error: ', e.message)
        debugMain('Error: ', e)
    }

}



function loadCommand(argv) {
    if (argv.help) {
        return require('./commands/version')
    }
    else {
        return () => argv.help()
    }
}


process.on('uncaughtException', function (e) {
    console.log('Error: ', e.message)
    debugMain('Error: ', e)
})

process.on('unhandledRejection', error => {
    // truffle-compile throws an unhandled promise rejection.   
})

