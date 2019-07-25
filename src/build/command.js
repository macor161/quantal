/**
 * @typedef {import('commander').Command} Command
 */
const { green } = require('chalk')
const { formatErrors } = require('../formatting/format-error')
const { formatWarnings } = require('../formatting/format-warnings')
const getOptions = require('../get-options')

/**
 * Returns the build command for Quantal CLI
 * @param {Object} options
 * @param {Command} options.argv CLI arguments
 * @param {Object} options.logger Logger
 * @returns {function} Build command
 */
function getBuildCmd({ argv, logger }) {
  return async () => {
    if (argv.watch) {
      logger.log('Starting build in watch mode')
      const { buildWatch } = require('./build-watch')
      const options = getOptions()

      await buildWatch(options, {
        onChange: onSourceFileChange,
        onBuildComplete: handleBuildResults,
      })
    } else {
      logger.log('Starting build')
      const { build } = require('./build')
      const options = getOptions()
      handleBuildResults(await build(options))
    }
  }

  function onSourceFileChange() {
    logger.log('Rebuilding')
    return getOptions()
  }

  function handleBuildResults(results) {
    if (results.errors && results.errors.length)
      logger.log(formatErrors(results.errors))
    else if (results.warnings.length)
      logger.log(formatWarnings(results.warnings))
    else
      logger.log(green.bold('Build successful'))
  }
}


module.exports = getBuildCmd
