const lineColumn = require("line-column")
const { isObject, range } = require('lodash')
const { promisify } = require('util')
const { isAbsolute } = require('path')
const fs = require('fs')
const readFile = promisify(fs.readFile)

const linesOfContext = 6


/**
 * Add details to a CompilerOutputError object
 */
module.exports = async function detailedCompilerOutputError(compilerOutputError) {
    if (!isAbsolute(compilerOutputError.sourceLocation.file))
        return compilerOutputError
        
    const fileContent = await readFile(compilerOutputError.sourceLocation.file, 'utf-8')
    //console.log(fileContent)

    const error = {
        ...compilerOutputError,
        sourceLocation: {
            ...compilerOutputError.sourceLocation,
            ...lineColumn(fileContent, compilerOutputError.sourceLocation.start)
        }
    }

    return addSourceContext(error, fileContent)

}

function addSourceContext(error, fileContent) {
    if (!isObject(error.sourceLocation) || isNaN(error.sourceLocation.line))
        return error

    const lines = fileContent.split(/\r?\n/)
    //    const lines = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n/)


    if (lines.length === 0)
        return error

    const index = error.sourceLocation.line - 1
    const lineStart = Math.max(0, index - Math.ceil((linesOfContext - 1) / 2)) + 1
    const lineEnd = Math.min(lines.length - 1, lineStart + linesOfContext - 1) + 1

    return {
        ...error,
        sourceContext: range(lineStart, lineEnd)
            .reduce((acc, line) => ({ ...acc, [line]: lines[line - 1] }), {})
    }
}

