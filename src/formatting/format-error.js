/** 
 * @typedef {import('../detailed-error').DetailedCompilerError} DetailedCompilerError 
 */

const {formatLine, formatSource} = require('./index')
const chalk = require('chalk')
const outdent = require('outdent')
const {cwd} = require('process')
const {relative} = require('path')
const {map} = require('../utils/template-literals')


/**
 * Format and highlight syntax of multiple Solidity
 * compiler errors
 * @param {DetailedCompilerError[]} errors 
 */
function formatErrors(errors) {
  return outdent`
        ${map(errors, (err) => `${formatError(err)}`)}
        ${chalk.bold.red(`Failed to compile: ${errors.length} error(s) found.`)}

    `
}

/**
 * Format and highlight syntax of a single Solidity
 * compiler error
 * @param {DetailedCompilerError} error
 */
function formatError(error) {
  if (!error.sourceContext) {
    return error.formattedMessage
  }

  const relativePath = relative(cwd(), error.sourceLocation.file)

  return outdent`    
  
    ${chalk.bgWhite.black(relativePath)}
       ${chalk.bold(`Line ${error.sourceLocation.line}:`)} ${error.message}

    ${formatSource(error.sourceContext, {postLineParse: postLineParse(error)})}

    `
}

function postLineParse(error) {
  return (line, lineNb) => {
    return parseInt(lineNb) === error.sourceLocation.line
            ? `${line.replace(' ', chalk.bold.red('>'))}\n${getArrowsLine(error)}`
            : line
  }
}

function getArrowsLine(error) {
  const {col} = error.sourceLocation

  if (col >= 0) {
    return formatLine(chalk.bold.red(`${' '.repeat(col - 1)}^`))
  }
}

module.exports = {formatErrors, formatError}
