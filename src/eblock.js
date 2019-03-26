import { getWeb3 } from './web3'

class Eblock {

    constructor(abi, address, opts = {}) {
        this._address = address
        this._opts = opts

        this.web3Contract = new this.web3.eth.Contract(abi, address, opts)


        for (const methodName in this.methods) 
            this.methods[methodName] = this.methods[methodName].bind(this)
                
    }

    async deploy(...args) {
        /*
        return (await this.getContract())
            .deploy() */
    }


    get web3() {
        return this._opts.web3 || getWeb3()
    }

}

Eblock.prototype.methods = {}


function sendTransaction() {
    
}

export { Eblock }