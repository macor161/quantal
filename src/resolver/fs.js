const path = require('path')
const fs = require('fs')
const eachSeries = require('async/eachSeries')

class FS {
  constructor(working_directory, contracts_build_directory) {
    this.working_directory = working_directory
    this.contracts_build_directory = contracts_build_directory
  }

  resolve(import_path, imported_from, callback) {
    imported_from = imported_from || ''

    const possible_paths = [
      import_path,
      path.join(path.dirname(imported_from), import_path),
    ]

    let resolved_body = null
    let resolved_path = null

    eachSeries(possible_paths, (possible_path, finished) => {
      if (resolved_body != null)
        return finished()


      // Check the expected path.
      fs.readFile(possible_path, { encoding: 'utf8' }, (err, body) => {
        // If there's an error, that means we can't read the source even if
        // it exists. Treat it as if it doesn't by ignoring any errors.
        // body will be undefined if error.
        if (body) {
          resolved_body = body
          resolved_path = possible_path
        }

        return finished()
      })
    }, err => {
      if (err)
        return callback(err)
      callback(null, resolved_body, resolved_path)
    })
  }

  // Here we're resolving from local files to local files, all absolute.
  resolve_dependency_path(import_path, dependency_path) {
    const dirname = path.dirname(import_path)
    return path.resolve(path.join(dirname, dependency_path))
  }
}


module.exports = FS
