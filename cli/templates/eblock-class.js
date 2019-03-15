const { getCallFunctions } = require('../abi')
const { map } = require('../template-literals')

module.exports = ({ name, abi }) => `
import { Eblock } from 'eblocks'

class ${name} extends Eblock {

    constructor(address, opts) {
        super(abi, address, opts)
    }

}

${map(getCallFunctions(abi), member => `
    ${name}.prototype.methods['${member.name}'] = async function(...args) { 
        return (await this.getContract()).methods['${member.name}'](...args).call()
    }
`
)}

const abi = ${JSON.stringify(abi)}

`

