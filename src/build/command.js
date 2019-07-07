const chalk = require('chalk')
const {formatErrors} = require('../formatting/format-error')
const {formatWarnings} = require('../formatting/format-warnings')
const getOptions = require('../get-options')

module.exports = ({argv}) => {
    return async () => {        
        if (argv.watch) {
            const { buildWatch } = require('./build-watch')
            const options = getOptions()
            await buildWatch()
        }
        else {
            const { build } = require('./build')
            const options = getOptions()
            const results = await build(options)

            if (results.errors && results.errors.length) 
                console.log(formatErrors(results.errors))
            else if (results.warnings.length) 
                console.log(formatWarnings(results.warnings))
            else 
                console.log(chalk.bold.green('Build successful'))                       
        }
    }
}