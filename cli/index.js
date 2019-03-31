#!/usr/bin/env node

const getOptions = require('./get-options')
const build = require('./build')
const { ganacheServer } = require('./ganache-server')


require('yargs')
  .scriptName("eblocks")
  .command('start', 'Start ganache server, compile contracts and generate json/js files', (yargs) => {
    yargs.option('w', {
        alias : 'watch',
        describe: 'Rebuild on file change',
        type: 'boolean', 
        default: false
    })
  }, async function (argv) {
    const options = getOptions()
    console.log('Starting Ganache server')
    const ganacheInfo = await ganacheServer(options.ganache)
    console.log(ganacheInfo.formattedInfo)
    await build({ watch: true })
  })

  .command('build', 'Compile contracts and generate json/js files', (yargs) => {
    yargs.option('w', {
        alias : 'watch',
        describe: 'Rebuild on file change',
        type: 'boolean', 
        default: false
    })
  }, async function (argv) {
    await build({ watch: argv.watch })
  })

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