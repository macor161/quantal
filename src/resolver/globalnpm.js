/* eslint no-empty: 0 */

const path = require('path')
const fs = require('fs')
const detectInstalled = require('detect-installed')
const get_installed_path = require('get-installed-path')

class GlobalNPM {
  resolve(import_path, imported_from, callback) {
    const [package_name] = import_path.split('/', 1)
    let body
    let absolutePath = import_path
    if (detectInstalled.sync(package_name)) {
      const regex = new RegExp(`/${package_name}$`)
      const global_package_path = get_installed_path
        .getInstalledPathSync(package_name)
        .replace(regex, '')
      const expected_path = path.join(global_package_path, import_path)
      try {
        body = fs.readFileSync(expected_path, { encoding: 'utf8' })
        absolutePath = expected_path
      } catch (err) {}
    }

    // If nothing's found, body returns `undefined`
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

module.exports = GlobalNPM
