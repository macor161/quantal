const lineColumn = require('line-column')
const {isObject, range, get} = require('lodash')
const {promisify} = require('util')
const {isAbsolute} = require('path')
const fs = require('fs')
const readFile = promisify(fs.readFile)

const LINES_OF_CONTEXT = 6

/**
 * Add details to a CompilerOutputError object
 */
module.exports = async function detailedCompilerOutputError(compilerOutputError, compileResult) {
  try {
    
    const fileContent = get(compileResult, 'source')
      ? compileResult.source
      : await getSource(compilerOutputError)

    if (!fileContent)
      return compilerOutputError

    const error = {
      ...compilerOutputError,
      sourceLocation: {
        ...compilerOutputError.sourceLocation,
        ...lineColumn(fileContent, compilerOutputError.sourceLocation.start),
      },
    }

    return addSourceContext(error, fileContent)
  } catch (e) {
    console.log('Error creating detailed error: ', e)
  }
}

function addSourceContext(error, fileContent) {
  if (!isObject(error.sourceLocation) || isNaN(error.sourceLocation.line)) {
    return error
  }

  const lines = fileContent.split(/\r?\n/)
  //    const lines = fileContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n/)


  if (lines.length === 0) {
    return error
  }

  const index = error.sourceLocation.line - 1
  const lineStart = Math.max(0, index - Math.ceil((LINES_OF_CONTEXT - 1) / 2)) + 1
  const lineEnd = Math.min(lines.length - 1, lineStart + LINES_OF_CONTEXT - 1) + 1

  return {
    ...error,
    sourceContext: range(lineStart, lineEnd)
        .reduce((acc, line) => ({...acc, [line]: lines[line - 1]}), {}),
  }
}


function getSource(compilerOutputError) {
  if (compilerOutputError.sourceLocation && isAbsolute(compilerOutputError.sourceLocation.file)) {
    return readFile(compilerOutputError.sourceLocation.file, 'utf-8')
  }
}
