/* eslint no-empty: 0 */

const path = require('path')
const fs = require('fs')
const detectInstalled = require('detect-installed')
const get_installed_path = require('get-installed-path')

class GlobalNPM {
  resolve(import_path, imported_from, callback) {
    const [package_name] = import_path.split('/', 1)
    let body
    if (detectInstalled.sync(package_name)) {
      const regex = new RegExp(`/${package_name}$`)
      const global_package_path = get_installed_path
        .getInstalledPathSync(package_name)
        .replace(regex, '')
      const expected_path = path.join(global_package_path, import_path)
      try {
        body = fs.readFileSync(expected_path, { encoding: 'utf8' })
      } catch (err) {}
    }

    // If nothing's found, body returns `undefined`
    return callback(null, body, import_path)
  }
}

module.exports = GlobalNPM
