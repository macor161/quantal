import { Eblock } from '../../eblock'
import { createEblock } from '../../create-eblock'
import { abi } from '../../../build/contracts/Test.json'
/*
export class Test extends Eblock {

    constructor(address, opts) {
        super(abi, address, opts)
        console.log(abi)
    }
}*/

const Test = createEblock(abi)

export { Test }