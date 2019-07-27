const debug = require('debug')('multiprocess-compiler')
const os = require('os')
const { basename } = require('path')
const chalk = require('chalk')
const Multispinner = require('multispinner')
const { DependencyTree } = require('../dependency-tree')

const cpus = os.cpus()
const Worker = require('./worker')
const { dispatchWork } = require('./dispatch-work')
const { CompilerResultsMerger } = require('./compiler-results-merger')

module.exports = function (sources, options, solcVersion) {
  return new Promise(res => {
    debug(`Generating dependency tree for ${cpus.length} workers`)

    const workers = initWorkers(solcVersion, options)

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

    const compilers = workers
      .filter(worker => worker.hasSources())

    const spinners = compilers
      .reduce((acc, compiler, i) => ({
        ...acc,
        [i]: `Compiler #${i + 1} ${chalk.gray(`[${`${unique(Object.keys(compiler.input.sources))
          .map(key => basename(key))
          .join(', ')
          .substring(0, 60)}...`}]`)}`,
      }), {})

    const multispinner = new Multispinner(spinners, {
      autoStart: true,
      indent: 1,
      color: {
        incomplete: 'white',
      },
    })

    debug(`sending input ${new Date().toISOString()}`)

    Promise.all(compilers
      .map((worker, i) => worker.compile().then(result => {
        multispinner.success(i)
        return result
      })))
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

/**
 * Returns as many workers as cpu available.
 * First worker is not creating a child process.
 */
function initWorkers(solcVersion, options) {
  return cpus
    .map((cpu, index) => new Worker({ version: solcVersion, id: index, compilerOptions: options }))
}

function unique(items) {
  return Array.from(new Set(items))
}
