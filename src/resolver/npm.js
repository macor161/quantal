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

    while (true) {
      const expected_path = path.join(modulesDir, 'node_modules', import_path)

      try {
        body = fs.readFileSync(expected_path, { encoding: 'utf8' })
        break
      } catch (err) {}

      // Recurse outwards until impossible
      const oldModulesDir = modulesDir
      modulesDir = path.join(modulesDir, '..')
      if (modulesDir === oldModulesDir)
        break
    }
    return callback(null, body, import_path)
  }
}


module.exports = NPM
