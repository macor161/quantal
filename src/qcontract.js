import { getInstance, QEth } from './qeth'
import { QTransaction } from './qtransaction'

/**
 * QContract uses symbols as property "backup" in case
 * a property is overridden by a smart contract method
 */
const props = {
    web3Contract: Symbol('web3Contract'),
    executeMethod: Symbol('executeMethod'),
    eth: Symbol('eth'),
    options: Symbol('options')
}

export class QContract {

    constructor(abi, address, opts = {}) {
        this.address = address
        this[props.options] = opts

        if (opts.provider)
            this[props.options].eth = new QEth({ provider: opts.provider })

        this.web3Contract 
            = this[props.web3Contract] 
            = new this[props.eth].Contract(abi, address, opts)                
    }

    get [props.eth]() { return this[props.options].eth || getInstance() }
    get eth() { return this[props.eth] }

    [props.executeMethod](methodName, args) {
        const abiMethod = this[props.web3Contract].abiModel.getMethod(methodName)
        const requestType = getRequestType(abiMethod.abiItem)
        const tx = this[props.web3Contract].methods[methodName](...args)

        return new QTransaction(tx, requestType, resp => handleResponse(resp, abiMethod))
    }
}

QContract.preGeneratedContracts = {}
QContract.properties = props


/**
 * Creates a QContract instance if the class is available.
 * Returns the smart contract address otherwise
 */
export function createContractInstance(name, address) {
    if (QContract.preGeneratedContracts[name])
        return new QContract.preGeneratedContracts[name](address)
    else
        return address
}

/**
 * Returns the request type of the ABI method. 
 * @param {Object} abiItem 
 * @returns {string|undefined} 'call', 'send' or undefined if not an ABI function
 */
function getRequestType(abiItem) {
    if (abiItem.type === 'function' || abiItem.type === 'constructor') {	
        if (abiItem.constant === true) 
            return 'call'

        return 'send'
    }    
}

/**
 * Converts the address parameters of a response to a QContract instance
 * if the parameter is a reference to a smart contract. 
 * TODO: Add an option to disable the conversion
 * @param {Object} response 
 * @param {Object} abiMethod 
 */
function handleResponse(response, abiMethod) {
    const abiOutputs = abiMethod.getOutputs()
    
    for (const i in abiOutputs) {
        const { name, contractName } = abiOutputs[i]

        if (contractName) {
            if (abiOutputs.length === 1)
                response = createContractInstance(contractName, response)
            else {
                response[i] 
                    = response[name] 
                    = createContractInstance(contractName, response[name])
            }
        }
    }
    
    return response
}

