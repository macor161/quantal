const debug = require('debug')('multiprocess-compiler')
const os = require('os')
const { DependencyTree } = require('../dependency-tree')

const cpus = os.cpus()
const Worker = require('./worker')
const { dispatchWork } = require('./dispatch-work')
const { CompilerResultsMerger } = require('./compiler-results-merger')

module.exports = function ({
  sources, compilerOptions, solcVersion, onUpdate,
} = {}) {
  return new Promise(res => {
    debug(`Generating dependency tree for ${cpus.length} workers`)

    const workers = initWorkers(solcVersion, compilerOptions)

    const dependencyTree = new DependencyTree()

    for (const key in sources) {
      // debug(`adding ${key} to dep tree`)
      dependencyTree.addFile(sources[key])
    }

    debug('creating work batches')
    const batches = dispatchWork(dependencyTree, cpus.length)

    debug('dispatching batches to workers')

    for (const [i] of batches.entries()) {
      const batch = batches[i]
      const worker = workers[i]
      debug(`batch ${i} load: ${batch.workload()}`)

      for (const branch of batch.getBranches())
        worker.addSource(branch)
    }


    debug(`sending input ${new Date().toISOString()}`)

    runWorkers(workers.filter(worker => worker.hasSources()), onUpdate)
      .then(results => new Promise(resolve => {
        // Must wait 80ms to prevent a display bug in multispinner
        setTimeout(() => resolve(results), 80)
      }))
      .then(results => {
        debug('merging results')
        // const result = results[0]
        const merger = new CompilerResultsMerger(results)

        debug('results merged')
        res(merger.getResults())
        workers.forEach(worker => worker.close())
      })
  })
}

async function runWorkers(workers, onUpdate = () => null) {
  return new Promise((res, rej) => {
    const results = []

    for (const worker of workers) {
      worker.compile()
        .then(result => {
          onUpdate(workers.map(w => w.getState()))
          results.push(result)

          if (results.length >= workers.length)
            res(results)
        })
        .catch(rej)
    }
    onUpdate(workers.map(w => w.getState()))
  })
}

/**
 * Returns as many workers as cpu available.
 * First worker is not creating a child process.
 */
function initWorkers(solcVersion, options) {
  return cpus
    .map((cpu, index) => new Worker({ version: solcVersion, id: index, compilerOptions: options }))
}
