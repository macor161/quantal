const { getCallFunctions } = require('../abi')
const { map } = require('../template-literals')
const outdent = require('outdent')
const outdentOpts = { trimTrailingNewline: false }

module.exports = ({ name, abi, bytecode }, libraryName) => `
import { Eblock } from '${libraryName}'

export class ${name} extends Eblock {

    constructor(address, opts) {
        super(${name}._abi, address, opts)
    }

}

${map(getCallFunctions(abi), member => outdent(outdentOpts)`
    ${name}.prototype.methods['${member.name}'] = function(...args) { 
        return this.web3Contract.methods['${member.name}'](...args).call()
    }
`
)}

${name}._abi = ${JSON.stringify(abi)}
${name}._bytecode = ${JSON.stringify(bytecode)}

`

