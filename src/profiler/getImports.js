const path = require('path')
const { isExplicitlyRelative } = require('./isExplicitlyRelative')
const Parser = require('../parser')
const { preParse } = require('../solidity-preparser')

const getImports = (file, { body, source }, solc, parserSolc) => {
  let imports

  // No imports in vyper!
  if (path.extname(file) === '.vy')
    return []

  if (parserSolc)
    imports = Parser.parseImports(body, parserSolc)
  else
    imports = Parser.parseImports(body, solc, preParse)

  // Convert explicitly relative dependencies of modules back into module paths.
  return imports.map(
    dependencyPath => (isExplicitlyRelative(dependencyPath)
      ? source.resolve_dependency_path(file, dependencyPath)
      : dependencyPath),
  )
}

module.exports = {
  getImports,
}
