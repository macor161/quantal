const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')
const compileContracts = require('./compile-contracts')
const fs = require('fs')
const path = require('path')


/**
 * 
 * @param {Object} opts Options
 * @param {Function} opts.onComplete Called everytime a build is successfully completed
 */
module.exports = async function(options = {}) {
    const buildFn = preventConcurentCalls(build)
    
    if (options.watch) {
        fs.watch(getPath('contracts'), async (eventType, fileName) => {
            if (path.extname(fileName).toLowerCase() !== '.sol')
                return

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

        console.log('Building')
        const options = getOptions()
        await compileContracts(options)
        await generateJsFiles(options)
        
        if (opts.onComplete)
            opts.onComplete()

        console.log('done')
        return true

    } catch(err) {
        console.log('Error: ', err.message)
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
        if (isRunning)
            return

        isRunning = true
        const returnedValue = await fn(...args)
        isRunning = false
        
        return returnedValue
    }
}



