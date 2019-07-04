const _ = require('lodash')
const { magenta, blue, cyan, green, gray } = require('chalk')
const stripAnsi = require('strip-ansi')
const pad = require('pad-left')


const syntax = [
  {
    regex: /(^|\(|\s+)(pragma|import|using|for|return|returns|require|emit)(\s+|\)|\;|$)/g,
    replacer: (match, p1, p2, p3) => p1 + magenta(p2) + p3
  }, 
  {
    regex: /(^|\(|\s+)(solidity|contract|is|memory|storage|mapping|function|private|public|internal|external|view|true|false)(\s+|\)|\;|$)/g,
    replacer: (match, p1, p2, p3) => p1 + blue(p2) + p3
  }, 
  { // Types
    regex: /(^|\(|\s+)(address|uint256|bytes32)(\s+|\)|\;|$)/g,
    replacer: (match, p1, p2, p3) => p1 + cyan(p2) + p3
  }, 
  { // Single line comments
    regex: /\/\/.*/,
    replacer: match => green(stripAnsi(match))
  }
]


const defaultOptions = {
  preLineParse: (lineValue, lineNb) => lineValue,
  postLineParse: (lineValue, lineNb) => lineValue,
  preParse: (lines) => lines,
  postParse: (content) => content,
}

/**
 * Highlight syntax of Solidity code
 * @param {Object} lines Properties are line numbers and values are lines content
 * @param {Object} options 
 * @return {string}
 */
function formatSource(lines, options = {}) {
  const opts = {...defaultOptions, ...options}

  const result = _(opts.preParse(lines))
      .map((val, lineNb) => formatLine(val, lineNb, opts.preLineParse, opts.postLineParse))
      .join('\n')

  return opts.postParse(result)
}

/**
 * Highlight syntax of a single line of Solidity code
 * @param {string} lineValue 
 * @param {number} lineNb 
 * @param {function} preParse 
 * @param {function} postParse 
 * @returns {string}
 */
function formatLine(lineValue, lineNb, preParse = defaultOptions.preLineParse, postParse = defaultOptions.postLineParse) {
  let parsedLineValue = preParse(lineValue, lineNb)

  for (const {regex, replacer} of syntax) 
    parsedLineValue = parsedLineValue.replace(regex, replacer)

  return postParse(`${parseLineNb(lineNb)} ${parsedLineValue}`, lineNb)
}

function parseLineNb(lineNb) {
  const line = lineNb !== undefined
    ? `${lineNb}`
    : ''

  return `  ${gray(`${pad(line, 3, ' ')} |`)}`
}

module.exports = {formatSource, formatLine}
