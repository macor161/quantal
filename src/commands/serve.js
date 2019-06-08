// This command is currently disabled
module.exports = ({argv, logger, getOptions}) => {
  return async () => {
    const build = require('../build')
    const {ganacheServer} = require('../ganache-server')

    const options = getOptions()
    logger('Starting Ganache server')
    const ganacheInfo = await ganacheServer(options.ganache)
    logger(ganacheInfo.formattedInfo)

    // TODO: Display warning if command is called without the --watch option

    await build({watch: argv.watch})
  }
}
