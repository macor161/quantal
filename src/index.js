#!/usr/bin/env node
require('v8-compile-cache')
require('./utils/setup-debug')

const debug = require('debug')('main')
const jsonPackage = require('../package.json')
const {Logger} = require('./utils/logger')
const logger = new Logger()

/**
 * Initial function called by Quantal CLI.
 * Parse arguments and launch the corresponding command.
 */
async function main() {
  try {
    debug('Quantal start')

    const argv = require('commander')
        .option('-w, --watch', 'Watch for changes')
        .version(jsonPackage.version)
        .parse(process.argv)

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
  // Temporarily using the commander.version() function
  // if (argv.version) {
  //     return require('./commands/version')({ argv, logger })
  // }
  return require('./build/command')({argv, logger})  
}

process.on('uncaughtException', function(e) {
  logger.error(e.message)
  debug('Uncaught Error: %o', e.stack)
})

main()
