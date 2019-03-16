const { getCallFunctions } = require('../abi')
const { map } = require('../template-literals')
const outdent = require('outdent')
const outdentOpts = { trimTrailingNewline: false }

module.exports = ({ name, abi, bytecode }, libraryName) => `
import { Eblock } from '${libraryName}'

class ${name} extends Eblock {

    constructor(address, opts) {
        super(${name}._abi, address, opts)
    }

}

${map(getCallFunctions(abi), member => outdent(outdentOpts)`
    ${name}.prototype.methods['${member.name}'] = async function(...args) { 
        return (await this.getContract()).methods['${member.name}'](...args).call()
    }
`
)}

${name}._abi = ${JSON.stringify(abi)}
${name}._bytecode = ${JSON.stringify(bytecode)}

`

