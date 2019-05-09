#!/usr/bin/env node

//const getOptions = require('./get-options')
//const build = require('./build')
//const { ganacheServer } = require('./ganache-server')
//const requireDir = require('require-dir')
//const { join, resolve } = require('path')
const debugMain = require('debug')('main')
debugMain('quantal start')
var program = require('commander')
debugMain('commander loaded')
const package = require('../package.json')
debugMain('package loaded')
//let dep = { getOptions }

// Load commands from folder and pass dependencies
//const commandsFn = requireDir(join(__dirname, 'commands'))
//const commands = Object.keys(commandsFn).map((i) => commandsFn[i](dep))

// Init CLI commands and options
//commands.forEach(cmd => yargs.command(cmd.command, cmd.desc, cmd.builder, cmd.handler))

program
  .version(package.version)
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv)

debugMain('quantal end')
console.log(program.peppers)

/*
async function main() {
    const options = getOptions()
    //watch()
    console.log('Starting Ganache server')
    const ganacheInfo = await ganacheServer(options.ganache)
    console.log(ganacheInfo.formattedInfo)
    console.log('Building smart contracts')
    await build({ watch: true })
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

//main()
//ganacheServer()*/