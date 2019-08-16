const path = require('path')
const requireAll = require('require-all')
const { build } = require('../../src/build/build')
const { getOptions } = require('../../src/options')


describe('bytecode comparison', () => {
  test('openzeppelin', async () => {
    const PATH = path.join(__dirname, 'openzeppelin-solidity')
    const options = getOptions({ cwd: PATH, noCache: true })

    const result = await build(options)
    const truffleContracts = requireAll(path.join(PATH, 'truffle-build', 'contracts'))

    compareContracts(result.contracts, truffleContracts)
  }, 30000)

  test('synthetix', async () => {
    const PATH = path.join(__dirname, 'synthetix')
    const options = getOptions({ cwd: PATH, noCache: true })

    const result = await build(options)
    const truffleContracts = requireAll(path.join(PATH, 'truffle-build', 'contracts'))

    compareContracts(result.contracts, truffleContracts)
  }, 30000)
})

function compareContracts(contracts, truffleContracts) {
  for (const [contractName, artifact] of Object.entries(contracts)) {
    const truffleContract = findContract(contractName, truffleContracts)

    if (!truffleContract)
      throw new Error(`Cannot find truffle contract ${contractName}`)

    if (artifact.bytecode !== truffleContract.bytecode) {
      console.error(`Bytecode mismatch for contract ${contractName}`)
      expect(artifact.bytecode).toEqual(truffleContract.bytecode)
    }
  }
}

function findContract(contractName, contracts) {
  for (const [, artifact] of Object.entries(contracts)) {
    if (artifact.contractName === contractName)
      return artifact
  }
}
