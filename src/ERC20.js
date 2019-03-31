import { ERC20 } from './index'

ERC20.prototype.deploy = function(...args) { 
    const result = this.web3Contract.deploy({ data: ERC20._bytecode, arguments: args }).send()
    //return tx
    result.once('transactionHash', hash => console.log('tx hash: ', hash))
    .once('receipt', receipt => console.log('once receipt: ', receipt))
    .on('confirmation', (confNumber, receipt) => console.log(`confirmation ${confNumber}: `, receipt))
    //.on('error', error => console.log('on error: ', error))
    .then(function(receipt){
        console.log('then: ', receipt)
    })
}
ERC20.prototype.methods['setValue'] = function(...args) { 
    const result = this.web3Contract.methods['setValue'](...args)
    result.once('transactionHash', hash => console.log('tx hash: ', hash))
    .once('receipt', receipt => console.log('once receipt: ', receipt))
    .on('confirmation', (confNumber, receipt) => console.log(`confirmation ${confNumber}: `, receipt))
    //.on('error', error => console.log('on error: ', error))
    .then(function(receipt){
        console.log('then: ', receipt)
    })
}

Test2.prototype.deploy = function(...args) { 
    return this.web3Contract.deploy({ data: Test2._bytecode, arguments: args })

}
Test2.prototype.methods['setValue'] = function(...args) { 
    return this.web3Contract.methods['setS'](...args)

}
Test2.prototype.methods['s'] = function(...args) { 
    return this.web3Contract.methods['s'](...args)
}
/*
ERC20.prototype.deploy = async function(...args) { 
    const contract = await this.getContract()
    const accounts = await (await this.getWeb3()).eth.getCachedAccounts()
    const result = contract.deploy({ data: ERC20._bytecode, arguments: args }).send({ from: accounts[0] })
    result.once('transactionHash', hash => console.log('tx hash: ', hash))
    .once('receipt', receipt => console.log('once receipt: ', receipt))
    .on('confirmation', (confNumber, receipt) => console.log(`confirmation ${confNumber}: `, receipt))
    //.on('error', error => console.log('on error: ', error)})
    .then(function(receipt){
        console.log('then: ', receipt)
    })
    .catch(err => console.log('catch error: ', err))
}*/