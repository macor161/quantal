const fs = require('fs')
const { isObject } = require('lodash')
const path = require('path')
const getPath = require('../utils/get-path')
const { build } = require('./build')

/**
 * @typedef WatchOptions
 * @property {function} onChange Called everytime a change is detected. Will prevent a new build if it returns `false`
 * @property {function} onBuildStart Called everytime a build is started
 * @property {function} onBuildComplete Called everytime a build is completed
 */
const DEFAULT_WATCH_OPTIONS = {
  onChange: () => null,
  onBuildStart: () => null,
  onBuildComplete: () => null,
}

/**
 * Build contracts and watch for changes
 * @param {Object} buildOptions Options
 * @param {WatchOptions} watchOptions Watch options
 */
async function buildWatch(buildOptions, watchOptions) {
  const { onChange, onBuildStart, onBuildComplete } = { ...DEFAULT_WATCH_OPTIONS, ...watchOptions }

  // Wrapper around the build function to prevent concurrent builds
  // e.g. When a file change is detected while a build is currently running
  const wrappedBuild = preventConcurentCalls(async options => {
    onBuildStart()
    const buildResults = await build(options)
    onBuildComplete(buildResults)
  })

  fs.watch(getPath('contracts'), async (eventType, fileName) => {
    if (path.extname(fileName).toLowerCase() !== '.sol')
      return

    const onChangeResults = onChange(eventType, fileName)

    // Don't rebuild if onChange returns `false`
    if (onChangeResults === false)
      return

    // Use onChange returned value as new build options
    const newBuildOptions = isObject(onChangeResults)
      ? onChangeResults
      : buildOptions

    await wrappedBuild(newBuildOptions)
  })

  await wrappedBuild(buildOptions)
}


/**
 * Prevent an async function to be called multiple times while still running
 * @param {function} fn
 */
function preventConcurentCalls(fn) {
  let isRunning = false

  return async function (...args) {
    if (isRunning)
      return

    isRunning = true
    const returnedValue = await fn(...args)
    isRunning = false

    return returnedValue
  }
}


module.exports = { buildWatch }
