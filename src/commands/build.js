
module.exports = ({ argv, logger, getOptions }) => {
    
  return async () => {
    const build = require('../build')
    await build({ watch: argv.watch })
  }

}