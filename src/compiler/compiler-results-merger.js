/* eslint-disable prefer-destructuring */
const _ = require('lodash')


class CompilerResultsMerger {
  constructor(compilerResults = []) {
    this._lastSourceId = 0
    this._lastAstNodeId = 0
    this._results = {
      contracts: {},
      sources: {},
      errors: [],
    }

    for (const compilerResult of compilerResults)
      this.addResults(compilerResult)
  }

  addResults(compilerResults) {
    const newIdSources = this._updateSourceIds(compilerResults.sources)

    const idMapping = Object.entries(compilerResults.sources)
      .map(([path, source]) => ({
        originalId: source.id,
        newId: (newIdSources[path] || this._results.sources[path]).id,
      }))

    const newSourceMapContracts = this._updateSourceMaps(compilerResults.contracts, idMapping)

    this._results.sources = { ...(this._results.sources), ...newIdSources }
    this._results.contracts = { ...(this._results.contracts), ...newSourceMapContracts }

    if (compilerResults.errors)
      this._results.errors = this._results.errors.concat(compilerResults.errors)
  }

  getResults() {
    return this._results
  }

  /**
   * Adjust sources id and add them to `this._results.sources`
   * @param {Object} sources
   * @returns {Map<number,Object>} Mapping of original source ids pointing to their updated source
   */
  _updateSourceIds(sources) {
    const orderedSources = _(sources)
      .entries()
      .map(([path, source]) => ({ path, source }))
      .sortBy(obj => obj.source.id)
      .value()

    const newSources = {}

    for (const { path, source } of orderedSources) {
      if (!this._results.sources[path] && !newSources[path]) {
        const newSource = { ...source }
        newSource.id = this._lastSourceId
        newSources[path] = newSource
        this._lastSourceId++
      }
    }

    return newSources
  }

  _updateSourceMaps(contracts, idMapping) {
    const newContracts = {}

    for (const [path, contractList] of Object.entries(contracts)) {
      if (!this._results.contracts[path]) {
        newContracts[path] = {}

        for (const [contractName, contract] of Object.entries(contractList)) {
          const newContract = _.cloneDeep(contract)
          newContract.evm.bytecode.sourceMap = this._updateSourceMap(contract.evm.bytecode.sourceMap, idMapping)
          newContract.evm.deployedBytecode.sourceMap = this._updateSourceMap(contract.evm.deployedBytecode.sourceMap, idMapping)
          newContracts[path][contractName] = newContract
        }
      }
    }

    return newContracts
  }

  /**
   * Update ids in source map
   * @param {string} sourceMap
   * @param {{ originalId:number, newId:number }[]} idMapping
   */
  _updateSourceMap(sourceMap, idMapping) {
    let newSourceMap = decompressSourceMap(sourceMap)

    for (const { originalId, newId } of idMapping) {
      const reg = new RegExp(`(\\d+\\:\\d+\\:)${originalId}(\\:|\\;)`, 'g')
      newSourceMap = newSourceMap.replace(reg, (match, p1, p2) => `${p1}${newId}${p2}`)
    }

    return newSourceMap
  }
}


function decompressSourceMap(sourceMap) {
  const instructions = sourceMap.split(';')
  let last = []

  return instructions
    .map(current => {
      const ret = [...last]
      const fields = current.split(':')

      if (fields[0] && fields[0] !== '-1' && fields[0].length)
        ret[0] = parseInt(fields[0], 10)

      if (fields[1] && fields[1] !== '-1' && fields[1].length)
        ret[1] = parseInt(fields[1], 10)

      if (fields[2] && fields[2].length)
        ret[2] = parseInt(fields[2], 10)

      if (fields[3] && fields[3].length)
        ret[3] = fields[3]

      last = ret
      return ret.join(':')
    })
    .join(';')
}


module.exports = { CompilerResultsMerger }
