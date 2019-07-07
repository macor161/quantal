const getOptions = require('../get-options')
const getPath = require('../utils/get-path')
const fs = require('fs')
const path = require('path')
const { preloadCompiler} = require('../compiler/load-compiler')

/**
 * Build contracts and watch for changes
 * @param {Object} buildOptions Options
 * @param {Object} watchOptions Watch options
 * @param {function} watchOptions.onChange Called everytime a change is detected
 * @param {function} watchOptions.onBuildStart Called everytime a build is started
 * @param {function} watchOptions.onBuildComplete Called everytime a build is completed
 */
async function buildWatch(buildOptions, watchOptions) {
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


module.exports = { buildWatch }