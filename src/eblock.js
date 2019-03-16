import getWeb3 from './utils/get-web3'

class Eblock {

    constructor(abi, address, opts) {
        this._abi = abi
        this._address = address
        this._opts = opts

        for (const methodName in this.methods) 
            this.methods[methodName] = this.methods[methodName].bind(this)
                
    }

    async deploy(...args) {
        /*
        return (await this.getContract())
            .deploy() */
    }

    async getContract() {
        if (this._contract)
            return this._contract

        const web3 = await this.getWeb3()
        this._contract = new web3.eth.Contract(this._abi, this._address, this._opts)
        return this._contract
    }

    async getWeb3() {
        return getWeb3()
    }

}

Eblock.prototype.methods = {}


function sendTransaction() {
    
}

export { Eblock }