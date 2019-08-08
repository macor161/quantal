/* eslint no-constant-condition: 0 */
/* eslint no-empty: 0 */

const path = require('path')
const fs = require('fs')

class NPM {
  constructor(working_directory) {
    this.working_directory = working_directory
  }

  resolve(import_path, imported_from, callback) {
    // If nothing's found, body returns `undefined`
    let body
    let modulesDir = this.working_directory
    let absolutePath = import_path

    while (true) {
      const expected_path = path.join(modulesDir, 'node_modules', import_path)

      try {
        body = fs.readFileSync(expected_path, { encoding: 'utf8' })
        absolutePath = expected_path
        break
      } catch (err) {}

      // Recurse outwards until impossible
      const oldModulesDir = modulesDir
      modulesDir = path.join(modulesDir, '..')
      if (modulesDir === oldModulesDir)
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
    return path.join(dirname, dependency_path)
  }
}


module.exports = NPM
