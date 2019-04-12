function getContractNode(ast, contractName) {
    return ast.nodes.find(contractNode =>
      contractNode.nodeType === "ContractDefinition"
      && contractNode.name === contractName
    )
}


module.exports = { getContractNode }