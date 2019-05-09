const path = require('path')

module.exports = function getPath(filePath) {
    return path.join(process.cwd(), filePath)
}

