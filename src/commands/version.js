module.exports = function({logger}) {
  return () => {
    const jsonPackage = require('../../package.json')
    logger(`${jsonPackage.name} v${jsonPackage.version}`)
  }
}
