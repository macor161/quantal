const getOptions = require('./get-options')
const getPath = require('./get-path')
const { generateJsFiles } = require('./generate-js-files')
const compileContracts = require('./compile-contracts')
const fs = require('fs')
const path = require('path')
const { throttle } = require('lodash')
const options = getOptions()

// Prevent multiple builds from running in parallel
let isBuildRunning = false

exports.build = throttle(async (options) => {    
    try {
        if (isBuildRunning) 
            return

        isBuildRunning = true
        console.log('Building')
        await compileContracts(options)
        await generateJsFiles(options)
        console.log('done')

        isBuildRunning = false

    } catch(err) {
        console.log('Error: ', err.message)
    }
}, options.throttle, { trailing: false })



exports.watch = async function() {
    const { build } = exports
    const options = getOptions()
    
    fs.watch(getPath('contracts'), async (eventType, fileName) => {
        if (path.extname(fileName).toLowerCase() !== '.sol')
            return

        console.log(`${eventType} file change: ${fileName}`)
        await build(options)
    })
}

