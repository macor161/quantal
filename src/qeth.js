import { Eth } from 'web3-eth'
import getProvider from './get-provider'

const DEFAULT_OPTIONS = {
    defaultBlock: 'latest',
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    syncDefaultAccount: true
}

export class QEth extends Eth {

    constructor(options) {
        const opts = { 
            ...DEFAULT_OPTIONS, 
            ...options 
        }

        super(options.provider, options.net, opts)
        this._options = opts

        this._onAccountsChange = accounts => {
            if (this._options.syncDefaultAccount)
                this.defaultAccount = accounts[0]
        }
        
        // Set defaultAccount if syncDefaultAccount is true
        if (opts.syncDefaultAccount) {
            if (opts.provider.selectedAddress)
                this.defaultAccount = opts.provider.selectedAddress
            else {
                this.getAccounts()
                    .then(accounts => this.defaultAccount = accounts[0])
            }
        }

        this.currentProvider.on('accountsChanged', this._onAccountsChange)
    }


}



let qethInstance
const DEFAULT_INIT_OPTIONS = { }

export async function init(options = DEFAULT_INIT_OPTIONS) {
  const ethOptions = {
    ...DEFAULT_INIT_OPTIONS,
    ...options,
    provider: options.provider || await getProvider()
  }

  qethInstance = new QEth(ethOptions)

  return qethInstance  
}



export function getInstance() {
  if (!qethInstance) 
    throw 'eth is not initialized'

  return qethInstance
}


