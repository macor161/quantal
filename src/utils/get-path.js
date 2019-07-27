const path = require('path')

module.exports = function getPath(filePath) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath)
}
