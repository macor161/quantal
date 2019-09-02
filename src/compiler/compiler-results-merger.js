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
    const sourceIdMapping = this._addSources(compilerResults.sources)

    this._results.contracts = { ...(this._results.contracts), ...(compilerResults.contracts) }

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
  _addSources(sources) {
    const orderedSources = _(sources)
      .entries()
      .map(([path, source]) => ({ path, source }))
      .sortBy(obj => obj.source.id)
      .value()

    // Mapping of old source ids pointing to the current sources
    const sourceIdMapping = new Map()

    for (const { path, source } of orderedSources) {
      if (!this._results.sources[path]) {
        const newSource = { ...source }
        newSource.id = this._lastSourceId
        sourceIdMapping.set(source.id, newSource)
        this._results.sources[path] = newSource
        this._lastSourceId++
      }
    }

    return sourceIdMapping
  }
}

module.exports = { CompilerResultsMerger }
