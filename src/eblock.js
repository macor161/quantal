import { getWeb3 } from './web3'
import { PromiseTransaction } from './promise-transaction'

export const properties = {
    web3Contract: Symbol('web3Contract'),
    executeMethod: Symbol('executeMethod')
}

export class Eblock {

    constructor(abi, address, opts = {}) {
        this._address = address
        this._opts = opts

        this.web3Contract = this[properties.web3Contract] = new this.web3.eth.Contract(abi, address, opts)                
    }

    get web3() { return this._opts.web3 || getWeb3() }

    [properties.executeMethod](methodName, args) {
        const requestType = this[properties.web3Contract].abiModel.getMethod(methodName).requestType 
        const tx = this[properties.web3Contract].methods[methodName](...args)
        return new PromiseTransaction(tx, requestType)
    }

}


