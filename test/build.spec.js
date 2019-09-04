const path = require('path')
const execa = require('execa')
const requireAll = require('require-all')
const { build } = require('../src/build/build')
const { getOptions } = require('../src/options')
const { decompressSourcemap } = require('../src/utils/sourcemap')


describe('build', () => {
  test('outputs valid artifacts', async () => {
    const PATH = path.join(__dirname, 'test-project')
    await execa('npm', ['install'], { cwd: PATH })
    await execa('./node_modules/.bin/truffle', ['compile', '--all'], { cwd: PATH })

    const options = getOptions({
      cwd: PATH,
      builtContractsDir: 'quantal-build',
      noCache: true,
    })

    const result = await build(options)
    const truffleArtifacts = requireAll(path.join(PATH, 'truffle-build'))

    compareBytecodes(result.contracts, truffleArtifacts)
    compareSourcemaps(result.contracts, truffleArtifacts)
  }, 60000)
})

function compareBytecodes(contracts, truffleContracts) {
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

function compareSourcemaps(contracts, truffleContracts) {
  const quantalSourceIdMap = new Map()
  const truffleSourceIdMap = new Map()

  for (const [contractName, artifact] of Object.entries(contracts))
    quantalSourceIdMap.set(getSourceIdFromAst(artifact.ast), artifact.sourcePath)

  for (const [contractName, artifact] of Object.entries(truffleContracts))
    truffleSourceIdMap.set(getSourceIdFromAst(artifact.ast), artifact.sourcePath)

  for (const [contractName, quantalContract] of Object.entries(contracts)) {
    const truffleContract = findContract(contractName, truffleContracts)

    const quantalInstructions = decompressSourcemap(quantalContract.sourceMap).split(';')
    const truffleInstructions = decompressSourcemap(truffleContract.sourceMap).split(';')

    for (const index in quantalInstructions) {
      const quantalId = quantalInstructions[index].split(':')[2]
      const truffleId = truffleInstructions[index].split(':')[2]

      expect(quantalSourceIdMap.get(quantalId)).toEqual(truffleSourceIdMap.get(truffleId))
    }

    if (!truffleContract)
      throw new Error(`Cannot find truffle contract ${contractName}`)
  }
}

function findContract(contractName, contracts) {
  for (const [, artifact] of Object.entries(contracts)) {
    if (artifact.contractName === contractName)
      return artifact
  }
}

function getSourceIdFromAst(ast) {
  if (ast.src)
    return parseInt(ast.src.split(':')[2], 10)
  throw new Error('Cannot find id from ast')
}
