const compileContracts = require('./compile-contracts')
const getOptions = require('./get-options')
const getPath = require('./utils/get-path')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const {formatErrors} = require('./formatting/format-error')
const {formatWarnings} = require('./formatting/format-warnings')
const { preloadCompiler} = require('./compiler/load-compiler')

/**
 * 
 * @param {Object} opts Options
 * @param {Function} opts.onComplete Called everytime a build is successfully completed
 */
module.exports = async function(options = {}) {
  const globalOptions = getOptions()
  console.log('Starting build task')

  await preloadCompiler(globalOptions.compiler.version)

  const buildFn = preventConcurentCalls(build)

  if (options.watch) {
    fs.watch(getPath('contracts'), async (eventType, fileName) => {
      if (path.extname(fileName).toLowerCase() !== '.sol') {
        return
      }

      console.log(`${eventType} file change: ${fileName}`)
      await buildFn(options)
    })
  }
  await buildFn(options)
}

/**
 *
 * @param {Object} opts Options
 */
async function build(opts) {
  try {
    const options = getOptions()
    const result = await compileContracts(options)
    // await generateJsFiles(options)

    if (opts.onComplete) {
      opts.onComplete()
    }

    if (result.warnings.length) {
      console.log(formatWarnings(result.warnings))
    } else {
      console.log(chalk.bold.green('Build successful'))
    }

    return true
  } catch (errors) {
    if (errors.length) {
      console.log(formatErrors(errors))
    } else {
      console.log('error: ', errors.stack)
    }
    return false
  }
}

/**
 * Prevent an async function to be called multiple times while still running
 * @param {Function} fn
 */
function preventConcurentCalls(fn) {
  let isRunning = false

  return async function(...args) {
    if (isRunning) {
      return
    }

    isRunning = true
    const returnedValue = await fn(...args)
    isRunning = false

    return returnedValue
  }
}
