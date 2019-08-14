const path = require('path')

module.exports = function getPath(filePath, cwd = '') {
  if (path.isAbsolute(filePath))
    return filePath

  return path.isAbsolute(cwd)
    ? path.join(cwd, filePath)
    : path.join(process.cwd(), cwd, filePath)
}
