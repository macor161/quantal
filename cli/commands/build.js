const build = require('../build')
const { ganacheServer } = require('../ganache-server')

module.exports = function (dep) {
    const { getOptions } = dep

    let cmd = {}
  
    cmd.command = 'build'
    cmd.desc = 'Compile contracts and generate json/js files'
    cmd.builder = {
        watch: {
            alias : 'w',
            describe: 'Rebuild on file change',
            type: 'boolean', 
            default: false
        }
    }

    cmd.handler = async function (argv) {
        await build({ watch: argv.watch })
      }
  
    return cmd
  }