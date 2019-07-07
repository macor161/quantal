const compileContracts = require('../compile-contracts')
const { preloadCompiler} = require('../compiler/load-compiler')



/**
 * Build contracts
 * @param {Object} options Options
 */
async function build(options) {
  try {
    await preloadCompiler(options.compiler.version)
    const result = await compileContracts(options)

    return result
  } catch (errors) {
    if (errors.length) {
      return { errors }
    } else {
      throw errors
    }
  }
}

module.exports = { build }
