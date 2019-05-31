const _ = require('lodash')
const chalk = require('chalk')
const pad = require('pad-left')

const KEYWORDS_COLORS = [{
  regex: /(^|\(|\s+)(pragma|import|using|for|return|returns|require|emit)(\s+|\)|\;|$)/g,
  color: 'magenta',
}, {
  regex: /(^|\(|\s+)(solidity|contract|is|mapping|function|private|public|internal|external|view|true|false)(\s+|\)|\;|$)/g,
  color: 'blue',
}, {
  regex: /(^|\(|\s+)(address|uint256|bytes32)(\s+|\)|\;|$)/g,
  color: 'cyan',
},
]

const defaultOptions = {
  preLineParse: (lineValue, lineNb) => lineValue,
  postLineParse: (lineValue, lineNb) => lineValue,
  preParse: (lines) => lines,
  postParse: (content) => content,
}

function formatSource(lines, options = {}) {
  const opts = {...defaultOptions, ...options}

  const result = _(opts.preParse(lines))
      .map((val, lineNb) => formatLine(val, lineNb, opts.preLineParse, opts.postLineParse))
      .join('\n')

  return opts.postParse(result)
}

function formatLine(lineValue, lineNb, preParse = defaultOptions.preLineParse, postParse = defaultOptions.postLineParse) {
  let parsedLineValue = preParse(lineValue, lineNb)
  KEYWORDS_COLORS.forEach(({regex, color}) => parsedLineValue = parsedLineValue.replace(regex, `$1${chalk[color]('$2')}$3`))
  return postParse(`${parseLineNb(lineNb)} ${parsedLineValue}`, lineNb)
}

function parseLineNb(lineNb) {
  const line = lineNb !== undefined
        ? `${lineNb}`
        : ''

  return `  ${chalk.gray(`${pad(line, 3, ' ')} |`)}`
}

module.exports = {formatSource, formatLine}
