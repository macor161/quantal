// Original source: https://github.com/trufflesuite/truffle/blob/v5.0.30/packages/truffle-resolver/index.js

const whilst = require('async/whilst')
const EPMSource = require('./epm')
const NPMSource = require('./npm')
const GlobalNPMSource = require('./globalnpm')
const FSSource = require('./fs')

/**
 * @param {Object} options
 * @param {string} options.cwd
 * @param {string} options.buildDir
 */
function Resolver(options) {
  this.options = options

  this.sources = [
    new EPMSource(options.cwd, options.buildDir),
    new NPMSource(options.cwd),
    new GlobalNPMSource(),
    new FSSource(options.cwd, options.buildDir),
  ]
}

Resolver.prototype.resolve = function (import_path, imported_from, callback) {
  const self = this

  if (typeof imported_from === 'function') {
    callback = imported_from
    imported_from = null
  }

  let resolved_body = null
  let resolved_path = null
  let current_index = -1
  let current_source

  whilst(
    () => !resolved_body && current_index < self.sources.length - 1,
    next => {
      current_index += 1
      current_source = self.sources[current_index]

      current_source.resolve(import_path, imported_from, (
        err,
        body,
        file_path,
      ) => {
        if (!err && body) {
          resolved_body = body
          resolved_path = file_path
        }
        next(err)
      })
    },
    err => {
      if (err)
        return callback(err)

      if (!resolved_body) {
        let message = `Could not find ${import_path} from any sources`

        if (imported_from)
          message += `; imported from ${imported_from}`


        return callback(new Error(message))
      }

      callback(null, resolved_body, resolved_path, current_source)
    },
  )
}

module.exports = Resolver
