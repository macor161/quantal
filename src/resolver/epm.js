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
    let absolutePath = import_path

    while (true) {
      let file_path = path.join(installDir, 'installed_contracts', import_path)

      try {
        body = fs.readFileSync(file_path, { encoding: 'utf8' })
        break
      } catch (err) {}

      file_path = path.join(installDir, 'installed_contracts', package_name, 'contracts', internal_path)

      try {
        body = fs.readFileSync(file_path, { encoding: 'utf8' })
        absolutePath = file_path
        break
      } catch (err) {}

      // Recurse outwards until impossible
      const oldInstallDir = installDir
      installDir = path.join(installDir, '..')
      if (installDir === oldInstallDir)
        break
    }

    return callback(null, body, absolutePath)
  }

  // We're resolving package paths to other package paths, not absolute paths.
  // This will ensure the source fetcher conintues to use the correct sources for packages.
  // i.e., if some_module/contracts/MyContract.sol imported "./AnotherContract.sol",
  // we're going to resolve it to some_module/contracts/AnotherContract.sol, ensuring
  // that when this path is evaluated this source is used again.
  resolve_dependency_path(import_path, dependency_path) {
    const dirname = path.dirname(import_path)
    let resolved_dependency_path = path.join(dirname, dependency_path)

    // Note: We use `path.join()` here to take care of path idiosyncrasies
    // like joining "something/" and "./something_else.sol". However, this makes
    // paths OS dependent, and on Windows, makes the separator "\". Solidity
    // needs the separator to be a forward slash. Let's massage that here.
    resolved_dependency_path = resolved_dependency_path.replace(/\\/g, '/')

    return resolved_dependency_path
  }
}

module.exports = EPM
