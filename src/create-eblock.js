import { Eblock } from './eblock'

export function createEblock(abi) {
    
    class EblockChild extends Eblock {

        constructor(address, opts) {
            super(abi, address, opts)
            console.log(abi)

        }
   
    }
    
   
    abi
        .filter(member => member.constant)
        .forEach(member => {
            EblockChild.prototype.methods[member.name] = async function(...args) { 
                return (await this.getContract()).methods[member.name](...args).call()
            }
        })
    
    

    return EblockChild
}


