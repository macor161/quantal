const {spawn} = require('child_process')
const JSONStream = require('JSONStream')
const {loadCompiler} = require('./load-compiler')
const {isEmpty} = require('lodash')

module.exports = class Worker {
  constructor({version, compilerOptions, id} = {}) {
    this.solcVersion = version
    this.compilerOptions = compilerOptions
    this.id = id
    this.branches = []
    this.input = {
      language: 'Solidity',
      settings: compilerOptions,
      sources: null,
    }

    // solc doesn't support empty brackets
    if (isEmpty(this.input.settings.evmVersion)) {
      this.input.settings.evmVersion = undefined
    }

    this._debug = require('debug')(`worker-${id}`)
  }

  addSource(sourceNode) {
    this.branches.push(sourceNode)
    this.input.sources = sourceNode.getNodes()
        .reduce((acc, dep) => {
          acc[dep.path] = {content: dep.content}
          return acc
        }, this.input.sources || {})
  }

  hasSources() {
    return this.input.sources != null
  }

  close() {
    if (this._process && !this._process.killed) {
      this._process.kill()
    }
  }

  async compile() {
    this._debug('compiling %o', this.input)
    this._debug(`time ${new Date().toISOString()}`)

    const result = await this._sendInputToProcess()
    this._debug('compile done')
    return result
  }

  _sendInputToProcess() {
    return new Promise(async (res, rej) => {
      const compilerPath = await loadCompiler(this.solcVersion)
      this._debug('spawning compiler process %o', compilerPath)
      const solc = spawn(compilerPath, ['--standard-json'])
      solc.stdin.setEncoding('utf-8')
      this._debug('compiler process ready')

      solc.stdout
          .pipe(JSONStream.parse())
          .on('data', (data) => {
            this._debug(`data received ${new Date().toISOString()}`)
            // Data could eventually be returned incrementally
            res(data)
          })

      solc.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });

      solc.on('close', () => {
        this._debug(`process connexion closed ${new Date().toISOString()}`)
      })

      solc.stdin.write(JSON.stringify(this.input) + '\n')
      solc.stdin.end()
    })
  }
}
