const {map} = require('../template-literals')
const outdent = require('outdent')
const outdentOpts = {trimTrailingNewline: false}

module.exports = ({name, abi, bytecode, methods, devdoc}, libraryName) => `
import { QContract, getInstance, QTransaction } from '${libraryName}'

const { executeMethod } = QContract.properties

export class ${name} extends QContract {

    constructor(address, opts) {
        super(${name}._abi, address, opts)
    }
}

${name}.deploy = function(...args) {
    if (!${name}._web3Contract)
        ${name}._web3Contract = new getInstance().Contract(${name}._abi)

    const tx = ${name}._web3Contract.deploy({ data: ${name}._bytecode, arguments: args })
    return new QTransaction(tx, 'send', response => new ${name}(response.address))
}

${map(methods, (member) => outdent(outdentOpts)`
    ${member.doc ? outdent`
    /**
     * ${member.doc.details}
     * 
     ${member.doc.params ? map(member.doc.params, (desc, param) => outdent(outdentOpts)`
        * @param ${param} ${desc}
     `) : ''} */
    ` : ''}
    ${name}.prototype['${member.name}'] = function(...args) { 
        return this[executeMethod]('${member.name}', args)
    }`
  )}

${name}._abi = ${JSON.stringify(abi)}
${name}._bytecode = ${JSON.stringify(bytecode)}

QContract.preGeneratedContracts['${name}'] = ${name}
`
