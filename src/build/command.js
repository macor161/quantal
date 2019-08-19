/**
 * @typedef {import('commander').Command} Command
 */
const { green } = require('chalk')
const { basename } = require('path')
const chalk = require('chalk')
const Multispinner = require('multispinner')
const { formatErrors } = require('../formatting/format-error')
const { formatWarnings } = require('../formatting/format-warnings')
const { getOptions } = require('../options')

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
      let multispinner

      options.onUpdate = workerStates => {
        if (!multispinner)
          multispinner = createSpinners(workerStates)
        else {
          for (const state of workerStates) {
            if (state.status === 'complete')
              multispinner.success(state.id)
          }
        }
      }

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

function createSpinners(compilers) {
  const spinners = compilers
    .reduce((acc, compiler, i) => ({
      ...acc,
      [parseInt(compiler.id, 10)]: `Compiler #${i + 1} ${chalk.gray(`${`${unique(compiler.contracts)
        .map(key => basename(key))
        .join(', ')
        .substring(0, 60)}...`}`)}`,
    }), {})

  return new Multispinner(spinners, {
    autoStart: true,
    indent: 1,
    color: {
      incomplete: 'white',
    },
  })
}

function unique(items) {
  return Array.from(new Set(items))
}


module.exports = getBuildCmd
