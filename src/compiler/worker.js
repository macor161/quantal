const { spawn } = require('child_process')
const JSONStream = require('JSONStream')
const { isEmpty } = require('lodash')
const { loadCompiler } = require('./load-compiler')

/**
 * State of a worker at a given time
 *
 * @typedef {Object} WorkerState
 * @property {number} id
 * @property {'running' | 'complete'} status Worker status
 * @property {string[]} contracts Path of the contracts handled by the worker
 */

module.exports = class Worker {
  constructor({ version, compilerOptions, id } = {}) {
    this.solcVersion = version
    this.compilerOptions = compilerOptions
    this.id = id
    this.branches = []
    this.input = {
      language: 'Solidity',
      settings: compilerOptions,
      sources: null,
    }
    this._status = null

    // solc doesn't support empty brackets
    if (isEmpty(this.input.settings.evmVersion))
      this.input.settings.evmVersion = undefined


    this._debug = require('debug')(`worker-${id}`)
  }

  addSource(sourceNode) {
    this.branches.push(sourceNode)
    this.input.sources = sourceNode.getNodes()
      .reduce((acc, dep) => {
        acc[dep.path] = { content: dep.content }
        return acc
      }, this.input.sources || {})
  }

  hasSources() {
    return this.input.sources != null
  }

  close() {
    if (this._process && !this._process.killed)
      this._process.kill()
  }

  async compile() {
    this._debug('compiling %o', this.input)
    this._debug(`time ${new Date().toISOString()}`)
    this._status = 'running'

    const result = await this._sendInputToProcess()

    for (const path in result.sources)
      result.sources[path].source = this.input.sources[path] && this.input.sources[path].content


    this._debug('compile done')
    return result
  }

  /**
   * @returns {WorkerState}
   */
  getState() {
    return {
      id: this.id,
      status: this._status,
      contracts: Object.keys(this.input.sources),
    }
  }

  _sendInputToProcess() {
    return new Promise(async res => {
      const compilerPath = await loadCompiler(this.solcVersion)
      this._debug('spawning compiler process %o', compilerPath)
      const solc = spawn(compilerPath, ['--standard-json'])
      solc.stdin.setEncoding('utf-8')
      this._debug('compiler process ready')

      solc.stdout
        .pipe(JSONStream.parse())
        .on('data', data => {
          this._debug(`data received ${new Date().toISOString()}`)
          this._status = 'complete'
          // Data could eventually be returned incrementally
          res(data)
        })

      solc.stderr.on('data', data => {
        console.log(`stderr: ${data}`)
      })

      solc.on('close', () => {
        this._status = 'complete'
        this._debug(`process connexion closed ${new Date().toISOString()}`)
      })

      solc.stdin.write(`${JSON.stringify(this.input)}\n`)
      solc.stdin.end()
    })
  }
}
