const build = require('../build')
const { ganacheServer } = require('../ganache-server')

module.exports = function (dep) {
    const { getOptions } = dep

    let cmd = {}
  
    cmd.command = 'start'
    cmd.desc = 'Start ganache server, compile contracts and generate json/js files'
    cmd.builder = { }

    cmd.handler = async function (argv) {
        const options = getOptions()
        console.log('Starting Ganache server')
        const ganacheInfo = await ganacheServer(options.ganache)
        console.log(ganacheInfo.formattedInfo)
        await build({ watch: true })
    }
  
    return cmd
  }