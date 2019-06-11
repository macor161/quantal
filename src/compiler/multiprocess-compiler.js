const debug = require('debug')('multiprocess-compiler')
const os = require('os')
const {DependencyTree} = require('../dependency-tree')
const cpus = os.cpus()
const Worker = require('./worker')
const {basename} = require('path')
const {dispatchWork} = require('./dispatch-work')
const Multispinner = require('multispinner')
const chalk = require('chalk')

module.exports = function(sources, options, solcVersion) {
  return new Promise((res, rej) => {
    debug(`Generating dependency tree for ${cpus.length} workers`)

    const workers = initWorkers(solcVersion, options)

    const dependencyTree = new DependencyTree()

    for (const key in sources) {
      // debug(`adding ${key} to dep tree`)
      dependencyTree.addFile(sources[key])
      // debug(`leafs: %o`, dependencyTree.getLeafs().map(f => f.path))
      // debug(`miss dep: %o`, dependencyTree._filesWithMissingDependencies.map(f => f.path))
    }

    debug('creating work batches')
    const batches = dispatchWork(dependencyTree, cpus.length)

    debug('dispatching batches to workers')
    for (const [i] of batches.entries()) {
      const batch = batches[i]
      const worker = workers[i]
      debug(`batch ${i} load: ${batch.workload()}`)

      for (const branch of batch.getBranches()) {
        worker.addSource(branch)
      }
    }

    const compilers = workers
        .filter((worker) => worker.hasSources())

    const f = ['Roles.sol', 'Roles.sol', 'IERC20.sol', 'SafeMath.sol', 'Address.sol', 'SafeERC20.sol', 'ReentrancyGuard.sol', 'Crowdsale.sol', 'TimedCrowdsale.sol']

    const spinners = compilers
        .reduce((acc, compiler, i) => ({
          ...acc,
          [i]: `Compiler #${i+1} ${chalk.gray(`[${unique(Object.keys(compiler.input.sources))
              .map((key) => basename(key))
              .filter((name, i) => i === 0 || !f.includes(name))
              .join(', ')
              .substring(0, 60) + '...'}]`)}`,
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
        .map((worker, i) => worker.compile().then((result) => {
          multispinner.success(i); return result
        }))
    )
        .then((results) => new Promise((res) => {
          // Must wait 80ms to prevent a display bug in multispinner
          setTimeout(() => res(results), 80)
        }))
        .then((results) => {
          debug('merging results')
          const result = results[0]
          // debug(`results ${0}: %o`, results[0])
          for (let i = 1; i < results.length; i++) {
            // debug(`results ${i}: %o`, results[i])
            result.sources = {...result.sources, ...(results[i].sources)}

            if (results[i].errors) {
              result.errors = (result.errors || []).concat(results[i].errors)
            }

            result.contracts = {...result.contracts, ...(results[i].contracts)}
          }
          debug('results merged')
          res(result)
          workers.forEach((worker) => worker.close())
        })
  })
}

/**
 * Returns as many workers as cpu available.
 * First worker is not creating a child process.
 */
function initWorkers(solcVersion, options) {
  return cpus
      .map((cpu, index) => new Worker({version: solcVersion, id: index, compilerOptions: options}))
}

function unique(items) {
  return Array.from(new Set(items))
}
