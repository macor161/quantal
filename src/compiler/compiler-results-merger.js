const _ = require('lodash')
const solidityAstTraverse = require('solidity-ast-traverse')


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

    this._updateAstSrcFields(newIdSources, idMapping)

    const newSourceMapContracts = this._updateSourceMaps(compilerResults.contracts, idMapping)

    this._results.sources = { ...(this._results.sources), ...newIdSources }
    this._results.contracts = { ...(this._results.contracts), ...newSourceMapContracts }

    if (compilerResults.errors)
      this._results.errors = this._results.errors.concat(compilerResults.errors)
  }

  getResults() {
    return this._results
  }

  _updateAstSrcFields(sources, idMapping) {
    Object.entries(sources).forEach(([, source]) => {
      solidityAstTraverse(source.ast, node => {
        if (node.src && typeof node.src === 'string') {
          const [offset, length, id] = node.src.split(':')
          const sourceId = parseInt(id, 10)

          if (sourceId >= 0 && idMapping[id])
            node.src = `${offset}:${length}:${idMapping[sourceId].newId}`
        }
      })
    })
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
    // No need to decompress sourcemap
    let newSourceMap = sourceMap

    for (const { originalId, newId } of idMapping) {
      const reg = new RegExp(`(\\d+\\:\\d+\\:)${originalId}(\\:|\\;)`, 'g')
      newSourceMap = newSourceMap.replace(reg, (match, p1, p2) => `${p1}${newId}${p2}`)
    }

    return newSourceMap
  }
}


module.exports = { CompilerResultsMerger }
