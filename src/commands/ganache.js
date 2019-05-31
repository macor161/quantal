const {ganacheServer} = require('../ganache-server')

module.exports = function(dep) {
  const {getOptions} = dep

  const cmd = {}

  cmd.command = 'ganache'
  cmd.desc = 'Start the ganache server'
  cmd.builder = { }

  cmd.handler = async function(argv) {
    const options = getOptions()
    const ganacheInfo = await ganacheServer(options.ganache)
    console.log(ganacheInfo.formattedInfo)
  }

  return cmd
}
