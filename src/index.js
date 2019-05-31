#!/usr/bin/env node
require('v8-compile-cache')

const debug = require('debug')('main')
debug('quantal start')

const jsonPackage = require('../package.json')
const {Logger} = require('./utils/logger')
const logger = new Logger()

main()

async function main() {
  try {
    const argv = require('commander')
        .option('-w, --watch', 'Watch for changes')
        .option('-s, --serve', 'Start a ganache server')
        .version(jsonPackage.version)
        .parse(process.argv)

    debug('argv loaded')

    const command = loadCommand({argv, logger})
    debug('command loaded')

    await command()
    debug('command executed successfully')
  } catch (e) {
    logger.error(e.message)
    debug('Error: %o', e.stack)
  }
}

function loadCommand({argv, logger}) {
  // TODO: commander.js doesn't support overriding the --version flag
  // We are temporarily using the commander.version() function
  // if (argv.version) {
  //     return require('./commands/version')({ argv, logger })
  // }
  // else if (argv.s) {
  if (argv.serve) {
    const getOptions = require('./get-options')
    return require('./commands/serve')({argv, logger, getOptions})
  } else {
    const getOptions = require('./get-options')
    return require('./commands/build')({argv, logger, getOptions})
  }
}

process.on('uncaughtException', function(e) {
  logger.error(e.message)
  debug('Uncaught Error: %o', e.stack)
})

process.on('unhandledRejection', (error) => {
  // truffle-compile throws an unhandled promise rejection.
})
