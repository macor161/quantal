/* eslint no-constant-condition: 0 */
/* eslint no-empty: 0 */

const path = require('path')
const fs = require('fs')

class EPM {
  constructor(working_directory, contracts_build_directory) {
    this.working_directory = working_directory
    this.contracts_build_directory = contracts_build_directory
  }

  resolve(import_path, imported_from, callback) {
    const separator = import_path.indexOf('/')
    const package_name = import_path.substring(0, separator)
    const internal_path = import_path.substring(separator + 1)
    let installDir = this.working_directory

    // If nothing's found, body returns `undefined`
    let body

    while (true) {
      let file_path = path.join(installDir, 'installed_contracts', import_path)

      try {
        body = fs.readFileSync(file_path, { encoding: 'utf8' })
        break
      } catch (err) {}

      file_path = path.join(installDir, 'installed_contracts', package_name, 'contracts', internal_path)

      try {
        body = fs.readFileSync(file_path, { encoding: 'utf8' })
        break
      } catch (err) {}

      // Recurse outwards until impossible
      const oldInstallDir = installDir
      installDir = path.join(installDir, '..')
      if (installDir === oldInstallDir)
        break
    }

    return callback(null, body, import_path)
  }
}

module.exports = EPM
