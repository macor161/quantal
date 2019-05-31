function getContract(ast, contractName) {
  return ast.nodes.find((contractNode) =>
    contractNode.nodeType === 'ContractDefinition'
      && contractNode.name === contractName
  )
}

/**
 *
 * TODO: Support inherited methods
 * @param {Object} astConract
 * @param {Object} abiMethod
 */
function getMethod(astConract, abiMethod) {
  return astConract.nodes.find((node) => (
    node.nodeType === 'FunctionDefinition'
            && node.name === abiMethod.name
            && compareParameters(node.parameters.parameters, abiMethod.inputs)
  ) || (
    abiMethod.inputs.length === 0
            && abiMethod.outputs.length === 1
            && node.nodeType === 'VariableDeclaration'
            && node.visibility === 'public'
            && node.name === abiMethod.name
  ))
}

/**
 * Compares parameter definitions from an ast and an abi method
 * Returns true if param definitions are equal
 * @param {*} astMethodParams
 * @param {*} abiMethodParams
 */
function compareParameters(astMethodParams, abiMethodParams) {
  if (astMethodParams.length !== abiMethodParams.length) {
    return false
  }

  for (const i in astMethodParams) {
    if (!isParamEqual(astMethodParams[i], abiMethodParams[i])) {
      return false
    }
  }
  return true
}

function isParamEqual(astMethodParam, abiMethodParam) {
  if (abiMethodParam.type === 'address'
        && astMethodParam.typeDescriptions.typeString.indexOf('contract ') === 0) {
    return true
  }
  return parseType(astMethodParam.typeName.name) === parseType(abiMethodParam.type)
}

function parseType(type) {
  if (type === 'uint') {
    return 'uint256'
  }
  return type
}

module.exports = {getContract, getMethod}
