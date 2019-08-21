const debug = require('debug')('multiprocess-compiler')
const os = require('os')
const { DependencyTree } = require('../dependency-tree')
const Worker = require('./worker')
const { dispatchWork } = require('./dispatch-work')
const { CompilerResultsMerger } = require('./compiler-results-merger')

const cpus = os.cpus()

/**
 * Compiler using multiple solc processes in parallel
 * @param {Object} options
 */
async function compiler(options) {
  const {
    sources, compilerOptions, solcVersion, onUpdate,
  } = options

  debug(`Generating dependency tree for ${cpus.length} workers`)

  const workers = initWorkers(solcVersion, compilerOptions)
  const dependencyTree = new DependencyTree()

  for (const key in sources)
    dependencyTree.addFile(sources[key])

  const batches = dispatchWork(dependencyTree, cpus.length)

  for (const [i] of batches.entries()) {
    const batch = batches[i]
    const worker = workers[i]

    for (const branch of batch.getBranches())
      worker.addSource(branch)
  }

  const results = await runWorkers(workers.filter(worker => worker.hasSources()), onUpdate)
  const merger = new CompilerResultsMerger(results)

  workers.forEach(worker => worker.close())
  return merger.getResults()
}

async function runWorkers(workers, onUpdate = () => null) {
  const asyncResults = workers
    .map(async worker => {
      const result = await worker.compile()
      onUpdate(workers.map(w => w.getState()))
      return result
    })

  onUpdate(workers.map(w => w.getState()))
  return Promise.all(asyncResults)
}

/**
 * Returns as many workers as cpu available.
 * First worker is not creating a child process.
 */
function initWorkers(solcVersion, options) {
  return cpus
    .map((cpu, index) => new Worker({ version: solcVersion, id: index, compilerOptions: options }))
}


module.exports = { compiler }
