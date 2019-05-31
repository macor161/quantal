class Logger {
  log(msg, ...args) {
    console.log(msg, ...args)
  }

  info(msg, ...args) {
    const {blue} = require('chalk')
    console.info(`${blue('Info')} ${msg} `, ...args)
  }

  warn(msg, ...args) {
    const {yellow} = require('chalk')
    console.warn(`${yellow('Warning')} ${msg} `, ...args)
  }

  error(msg, ...args) {
    const {red} = require('chalk')
    console.error(`${red.bold('Error')} ${msg} `, ...args)
  }
}

module.exports = {Logger}
