const { getCallFunctions } = require('../abi')

module.exports = ({ name, abi }) => `
import { Eblock } from 'eblocks'

class ${name} extends Eblock {

    constructor(address, opts) {
        super(abi, address, opts)
    }

}

${getCallFunctions(abi).map(member => `
    ${name}.prototype.methods['${member.name}'] = async function(...args) { 
        return (await this.getContract()).methods['${member.name}'](...args).call()
    }
`
)}

const abi = ${abi}

`

