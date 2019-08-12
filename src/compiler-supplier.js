class CompilerSupplier {
  load() {
    return require('solc')
  }
}

module.exports = CompilerSupplier
