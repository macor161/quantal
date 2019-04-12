function getContract(ast, contractName) {
    return ast.nodes.find(contractNode =>
      contractNode.nodeType === 'ContractDefinition'
      && contractNode.name === contractName
    )
}

function getMethod(astConract, abiMethod) {
    return astConract.nodes.find(node =>
        node.nodeType === 'FunctionDefinition' 
        && node.name === abiMethod.name  
        && compareParameters(node.parameters.parameters, abiMethod.inputs) 
    )
}


/**
 * Compares parameter definitions from an ast and an abi method
 * Returns true if param definitions are equal
 * @param {*} astMethodParams 
 * @param {*} abiMethodParams 
 */
function compareParameters(astMethodParams, abiMethodParams) {
    if (astMethodParams.length !== abiMethodParams.length)
        return false

             
    for(const i in astMethodParams) {
        if (astMethodParams[i].typeName.name !== abiMethodParams[i].type)
            return false
    }

    return true
}


module.exports = { getContract, getMethod }