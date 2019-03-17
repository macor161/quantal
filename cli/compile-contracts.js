function compileContracts(ioptions) {
    return new Promise((res, rej) => {
        const Contracts = require("truffle-workflow-compile")
        const Config = require("truffle-config");
        const config = Config.detect({})  
        
        Contracts.compile(config, (err, result) => {
            if (err) 
                return rej(err)            

            res(result)           
        })
    })
}


module.exports = compileContracts