#!/usr/bin/env node

const getOptions = require('./get-options')
const build = require('./build')
const { ganacheServer } = require('./ganache-server')
const requireDir = require('require-dir')
const { join, resolve } = require('path')
const yargs = require('yargs')

let dep = { getOptions }

// Load commands from folder and pass dependencies
const commandsFn = requireDir(join(__dirname, 'commands'))
const commands = Object.keys(commandsFn).map((i) => commandsFn[i](dep))

// Init CLI commands and options
commands.forEach(cmd => yargs.command(cmd.command, cmd.desc, cmd.builder, cmd.handler))

yargs
  .scriptName("eblocks")


  .command('ganache', 'Start ganache server', (yargs) => {
  }, async function (argv) {
    const options = getOptions()
    const ganacheInfo = await ganacheServer(options.ganache)
    console.log(ganacheInfo.formattedInfo)
  })

  .alias('v', 'version')
  .version()
  .describe('v', 'show version information')
  .usage('$0 <cmd> [args]')
  .help()
  .argv


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
//ganacheServer()