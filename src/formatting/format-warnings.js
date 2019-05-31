const {formatLine, formatSource} = require('./index')
const chalk = require('chalk')
const outdent = require('outdent')
const {cwd} = require('process')
const {relative} = require('path')
const {map} = require('../template-literals')

function formatWarnings(warnings) {
  return outdent`
        ${map(warnings, (err) => `${formatWarning(err)}`)}    
        ${chalk.bold.yellow(`Compiled with ${warnings.length} warnings`)}

    `
}

function formatWarning(warning) {
  if (!warning.sourceContext) {
    return warning.formattedMessage
  }

  const relativePath = relative(cwd(), warning.sourceLocation.file)

  return outdent`    
    ${chalk.bgWhite.black(relativePath)}
       ${chalk.bold(`Line ${warning.sourceLocation.line}:`)} ${warning.message}

    ${formatSource(warning.sourceContext, {postLineParse: postLineParse(warning)})}
    `
}

function postLineParse(error) {
  return (line, lineNb) => {
    return parseInt(lineNb) === error.sourceLocation.line
            ? `${line.replace(' ', chalk.bold.yellow('>'))}\n${getArrowsLine(error)}`
            : line
  }
}

function getArrowsLine(error) {
  const {col} = error.sourceLocation
  if (col >= 0) {
    return formatLine(chalk.bold.yellow(`${' '.repeat(col - 1)}^`))
  }
}

module.exports = {formatWarnings, formatWarning}
