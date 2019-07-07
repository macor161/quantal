/**
 * @typedef {import('commander').Command} Command
 */
const chalk = require('chalk')
const {formatErrors} = require('../formatting/format-error')
const {formatWarnings} = require('../formatting/format-warnings')
const getOptions = require('../get-options')

/**
 * Returns the build command for Quantal CLI
 * @param {Object} options
 * @param {Command} options.argv CLI arguments
 * @param {Object} options.logger Logger
 * @returns {function} Build command
 */
function getBuildCmd({argv, logger}) {
    return async () => {        
        if (argv.watch) {
            const { buildWatch } = require('./build-watch')
            const options = getOptions()
            await buildWatch()
        }
        else {
            const { build } = require('./build')
            const options = getOptions()
            const results = await build(options)

            if (results.errors && results.errors.length) 
                logger.log(formatErrors(results.errors))
            else if (results.warnings.length) 
                logger.log(formatWarnings(results.warnings))
            else 
                logger.log(chalk.bold.green('Build successful'))                       
        }
    }
}

module.exports = getBuildCmd