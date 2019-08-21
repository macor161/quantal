/**
 * @typedef {import('commander').Command} Command
 * @typedef {import('../compiler/worker').WorkerState} WorkerState
 */
const { green, gray } = require('chalk')
const { basename } = require('path')
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

  /**
   * Called when a source file is modified.
   * Used with the `--watch` option
   */
  function onSourceFileChange() {
    logger.log('Rebuilding')
    return getOptions()
  }

  /**
   * Display build results
   * @param {Object} results
   */
  function handleBuildResults(results) {
    if (results.errors && results.errors.length)
      logger.log(formatErrors(results.errors))
    else if (results.warnings.length)
      logger.log(formatWarnings(results.warnings))
    else
      logger.log(green.bold('Build successful'))
  }

  /**
   * Create compilation workers progress spinners
   * @param {WorkerState[]} workers
   */
  function createSpinners(workers) {
    const spinners = workers
      .reduce((acc, compiler, i) => ({
        ...acc,
        [compiler.id]: `Compiler #${i + 1} ${gray(getContractNames(compiler.contracts))}`,
      }), {})

    return new Multispinner(spinners, {
      autoStart: true,
      indent: 1,
      color: {
        incomplete: 'white',
      },
    })
  }

  /**
   * Return the contract names, separated by commas
   * @param {string} contractPaths
   * @param {number} maxLength Maximum length of returned string
   * @returns {string}
   */
  function getContractNames(contractPaths, maxLength = 60) {
    const names = contractPaths
      .map(key => basename(key))
      .join(', ')

    return names.length > maxLength
      ? `${names.substring(0, maxLength - 3)}...`
      : names
  }
}


module.exports = getBuildCmd
