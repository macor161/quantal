const debug = require('debug')('dependency-management')

module.exports = function({ logger = console } = {}) {
    return { dependencyCheck }
    
    
    async function dependencyCheck() {    
        const { platform } = require('os')
        
        if (platform() === 'darwin') {
            if (await missingDependency('z3')) 
                await installDependency('z3')                   
        }
    }
    


    function installDependency(dependency) {
        return new Promise(async (res, rej) => { 
            if (await missingDependency('brew')) 
                throw new Error(`homebrew and ${dependency} must be installed.`)

            const { spawn } = require('child_process')
            logger.log(`Installing ${dependency}`)

            const brew = spawn('brew', ['install', dependency])
            
            brew.on('close',  code => {
                if (code === 0)
                    return res()
                else {
                    debug(`closed: ${code}`)
                    rej(code)
                }
            }) 

            brew.on('message', message => debug('message: %o', message))

            /*brew.stdout.on('data', data => {
                debug(`data: ${data}`)
            })*/
            brew.stdout.pipe(process.stdout)
                
            
        })
    }




    function missingDependency(dependency) {
        return new Promise((res, rej) => {
            const exists = require('command-exists')

            exists(dependency, (err, commandExists) => {
                if (err)
                    return rej(err)

                return res(!commandExists)
            })
        })
    }

}