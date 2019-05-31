module.exports = ({argv}) => {
  return async () => {
    const build = require('../build')
    await build({watch: argv.watch})
  }
}
