import { Eblock } from '../../eblock'
import { abi } from '../../../build/contracts/ERC20.json'
import { createEblock } from '../../create-eblock'

/*
class Erc20 extends Eblock {

    constructor(address, opts) {
        super(abi, address, opts)
        console.log(abi)
    }

}*/

const Erc20 = createEblock(abi)




export { Erc20 }