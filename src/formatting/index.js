const _ = require('lodash')
const stripAnsi = require('strip-ansi')
const pad = require('pad-left')
const {magenta, blue, cyan, green, gray} = require('chalk')

/**
 * @typedef SyntaxColors Solidity code highlight syntax colors.
 * @property {function} controls Controls color (pragma, import, using, etc) Default: `chalk.magenta`
 * @property {function} declarations Declarations color (contract, storage, memory, etc) Default: `chalk.blue`
 * @property {function} types  Types color (uint, address, string, etc) Default: `chalk.cyan`
 * @property {function} comments  Comments color. Default: `chalk.green`
 * @property {function} lineNumbers  Line numbers color. Default: `chalk.gray`
 */
const DEFAULT_COLORS = { 
  controls: magenta, 
  declarations: blue, 
  types: cyan, 
  comments: green, 
  lineNumbers: gray 
}


/**
 * @typedef {Object} FormatSourceOptions 
 * @property {function} preLineParse
 * @property {function} postLineParse
 * @property {function} preParse
 * @property {function} postParse
 * @property {SyntaxColors} colors
 */
const defaultFormatSourceOptions = {
  preLineParse: (lineValue, lineNb) => lineValue,
  postLineParse: (lineValue, lineNb) => lineValue,
  preParse: (lines) => lines,
  postParse: (content) => content,
  colors: DEFAULT_COLORS
}


/**
 * @param {Object} lines 
 * @param {FormatSourceOptions} options
 * @returns {string}
 */
function formatSource(lines, options) {
  const opts = {...defaultFormatSourceOptions, ...options}

  const result = _(opts.preParse(lines))
      .map((val, lineNb) => {
        return formatLine(val, lineNb, { 
          preParse: opts.preLineParse, 
          postParse: opts.postLineParse, 
          colors: opts.colors 
        })
      })
      .join('\n')

  return opts.postParse(result)
}


/**
 * Highlight syntax of a single line of Solidity code
 * @param {string} lineValue 
 * @param {number} lineNb 
 * @param {Object} options
 * @param {function} options.preParse 
 * @param {function} options.postParse 
 * @param {SyntaxColors} options.colors
 * @returns {string}
 */
function formatLine(lineValue, lineNb, options) {
  const { preParse, postParse, colors } = {
     preParse: defaultFormatSourceOptions.preLineParse, 
     postParse: defaultFormatSourceOptions.postLineParse, 
     colors: DEFAULT_COLORS,
     ...options
  }

  let parsedLineValue = preParse(lineValue, lineNb)
  const syntax = getSyntax(colors)

  for (const {regex, replacer} of syntax) 
    parsedLineValue = parsedLineValue.replace(regex, replacer)

  return postParse(`${parseLineNb(lineNb, colors.lineNumbers)} ${parsedLineValue}`, lineNb)
}


/**
 * Returns a list of syntax regexes and replacer functions to 
 * parse Solidity code
 * @param {SyntaxColors} colors Color functions
 * @returns {{ regex: Regex, replacer: function}[]} 
 */
function getSyntax({ controls, declarations, types, comments }) {

  return [
    { // Controls
      regex: /(^|\(|\s+)(pragma|import|using|for|returns?|require|emit)(\s+|\(|\)|\;|$)/g,
      replacer: (match, p1, p2, p3) => p1 + controls(p2) + p3
    }, 
    { // Declarations
      regex: /(^|\(|\s+)(solidity|contract|is|memory|storage|mapping|constructor|view|function|private|public|internal|external|indexed|event|true|false)(\s+|\(|\)|\;|$)/g,
      replacer: (match, p1, p2, p3) => p1 + declarations(p2) + p3
    }, 
    { // Types
      regex: /(^|\(|\s+)(address|string|u?int\d*|bool|bytes\d*)(\s+|\(|\)|\;|$)/g,
      replacer: (match, p1, p2, p3) => p1 + types(p2) + p3
    }, 
    { // Single line comments
      regex: /\/\/.*/,
      replacer: match => comments(stripAnsi(match))
    }
  ]
}

function parseLineNb(lineNb, color) {
  const line = lineNb !== undefined
    ? `${lineNb}`
    : ''

  return `  ${color(`${pad(line, 3, ' ')} |`)}`
}

module.exports = {formatSource, formatLine}
