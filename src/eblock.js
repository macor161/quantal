import { getInstance } from './quantal-eth'
import { PromiseTransaction } from './promise-transaction'

export const properties = {
    web3Contract: Symbol('web3Contract'),
    executeMethod: Symbol('executeMethod')
}

export class Eblock {

    constructor(abi, address, opts = {}) {
        this._address = address
        this._opts = opts

        if (opts.provider)
            this._opts.eth = new QuantalEth({ provider: opts.provider })

        this.web3Contract = this[properties.web3Contract] = new this.eth.Contract(abi, address, opts)                
    }

    get eth() { return this._opts.eth || getInstance() }

    [properties.executeMethod](methodName, args, txResponseMiddleware) {
        const requestType = getRequestType(this[properties.web3Contract].abiModel.getMethod(methodName).abiItem)
        const tx = this[properties.web3Contract].methods[methodName](...args)
        return new PromiseTransaction(tx, requestType, txResponseMiddleware)
    }

}


function getRequestType(abiItem) {
    if (abiItem.type === 'function' || abiItem.type === 'constructor') {	
        if (abiItem.constant === true) 
            return 'call'

        return 'send'
    }    
}