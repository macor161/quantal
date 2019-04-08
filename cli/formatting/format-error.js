const { formatLine, formatSource } = require('./index')
const chalk = require('chalk')
const outdent = require('outdent')
const { cwd } = require('process')
const { relative } = require('path')
const { map } = require('../template-literals')


function formatErrors(errors) {
    return outdent`
    
        ${chalk.bold.red('Failed to compile.')}

        ${map(errors, err => `${formatError(err)}\n`)}
    `
}

function formatError(error) {
    if (!error.sourceContext)
        return error.formattedMessage

    const relativePath = relative(cwd(), error.sourceLocation.file)
    
    return outdent`    
    ${chalk.bgWhite.black(relativePath)}
       ${chalk.bold(`Line ${error.sourceLocation.line}:`)} ${error.message}

    ${formatSource(error.sourceContext, { postLineParse: postLineParse(error) })}
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
    const { col } = error.sourceLocation

    if (col >= 0) {
        return formatLine(chalk.bold.red(`${' '.repeat(col - 1)}^`))
    }
}


module.exports = { formatErrors, formatError }