const isExplicitlyRelative = importPath => importPath.indexOf('.') === 0

module.exports = {
  isExplicitlyRelative,
}
